# LLM Inference — 50 Slides
### From Token Generation to Production Serving
**YouTube Presentation Deck · Part 2 of 2**

---

## Slide 1 — What Is LLM Inference?

- **Inference** = running a trained model to generate outputs for user requests
- Every time you use ChatGPT, Claude, or Copilot — that's inference
- Two distinct phases:
  1. **Prefill**: process the input prompt in one forward pass (parallelizable)
  2. **Decode**: generate output tokens one at a time (sequential)

```
User: "Explain quantum entanglement"
         ↓ Prefill (fast — processes all tokens at once)
  Model encodes the question
         ↓ Decode (slower — one token at a time)
  "Quantum" → "entanglement" → "is" → "a" → ...
```

> Training happens once. Inference happens billions of times per day. Optimizing inference is worth enormous effort.

---

## Slide 2 — Autoregressive Generation

- LLMs generate text **one token at a time**, left to right
- Each new token is conditioned on all previous tokens (including the prompt)

```python
def generate(model, prompt_ids, max_new_tokens=100):
    input_ids = prompt_ids
    for _ in range(max_new_tokens):
        # Forward pass: (batch, seq_len) → (batch, seq_len, vocab_size)
        logits = model(input_ids)
        # Take logits at the LAST position only
        next_token_logits = logits[:, -1, :]
        # Sample or argmax
        next_token = next_token_logits.argmax(dim=-1, keepdim=True)
        # Append to sequence
        input_ids = torch.cat([input_ids, next_token], dim=-1)
        if next_token == EOS_TOKEN: break
    return input_ids
```

- Problem: with naïve implementation, each step **recomputes all past tokens** → O(N²) cost

---

## Slide 3 — The KV Cache: The Core Inference Optimization

- During decoding, the K and V matrices for past tokens **never change**
- Store them in a cache — only compute for the new token each step

```
Without KV cache:
  Step 5: compute K,V for tokens 1,2,3,4,5
  Step 6: compute K,V for tokens 1,2,3,4,5,6  ← redundant!

With KV cache:
  Step 5: compute K,V for token 5 only, retrieve cache for 1-4
  Step 6: compute K,V for token 6 only, retrieve cache for 1-5
          ↑ O(1) per step instead of O(N)
```

**KV Cache memory formula:**
```
bytes = 2 × n_layers × n_kv_heads × d_head × seq_len × dtype_bytes
Llama-2 70B, seq=4096, fp16:
= 2 × 80 × 8 × 128 × 4096 × 2 = ~1.34 GB per sequence
```

---

## Slide 4 — KV Cache Memory Bottleneck

- Modern LLMs with long contexts require **massive KV caches**
- A100 80GB: model weights ~140GB (fp16) + KV cache leaves very little room

| Model | Params | Weight Memory | KV Cache per seq (4K) | Max concurrent seqs |
|-------|--------|---------------|----------------------|---------------------|
| Llama-2 7B | 7B | 14 GB | 0.5 GB | ~120 |
| Llama-2 70B | 70B | 140 GB | 1.3 GB | ~30 (on 2×A100) |
| Mistral 7B (GQA) | 7B | 14 GB | 0.13 GB | ~500 |

- **Grouped Query Attention (GQA)**: share K/V across groups of Q heads
  - Llama-2 70B uses 8 KV heads vs 64 Q heads → 8× KV cache reduction

---

## Slide 5 — Sampling Strategies

**Greedy decoding**: always pick the highest probability token
- Deterministic, but often repetitive and dull

**Temperature sampling**: scale logits before softmax
```python
logits = logits / temperature   # T < 1: sharper; T > 1: more random
probs = F.softmax(logits, dim=-1)
next_token = torch.multinomial(probs, num_samples=1)
```

**Top-k sampling**: sample only from the top k tokens by probability

**Top-p (nucleus) sampling**: sample from smallest set whose cumulative probability ≥ p
```python
sorted_probs, sorted_idx = probs.sort(descending=True)
cumprobs = sorted_probs.cumsum(dim=-1)
# Remove tokens beyond the nucleus
sorted_probs[cumprobs - sorted_probs > top_p] = 0
```

---

## Slide 6 — Decoding Strategies: Beam Search vs Sampling

| Strategy | Deterministic | Quality | Speed | Use Case |
|----------|--------------|---------|-------|----------|
| Greedy | ✅ Yes | Medium | Fastest | Short factual answers |
| Beam Search | ✅ Yes | High | Slow | Translation, summarization |
| Temperature | ❌ No | Variable | Fast | Creative writing |
| Top-p | ❌ No | Good | Fast | General chat |
| Top-k + Temp | ❌ No | Good | Fast | Code generation |

**Modern best practice for chat LLMs:**
- Temperature = 0.7, top-p = 0.9, top-k = 50
- Low temperature for factual queries (0.1–0.3)
- Higher temperature for creative tasks (0.8–1.2)

---

## Slide 7 — Repetition Penalty

- LLMs often repeat themselves without repetition penalty
- Reduce probability of tokens that have already appeared

```python
def apply_repetition_penalty(logits, input_ids, penalty=1.3):
    for token_id in set(input_ids.tolist()):
        if logits[token_id] < 0:
            logits[token_id] *= penalty      # make more negative
        else:
            logits[token_id] /= penalty      # reduce positive logit
    return logits
```

- Typical value: 1.1–1.3
- Too high → model avoids all common words → incoherent text
- Frequency penalty (GPT-API): scales penalty by number of occurrences

---

## Slide 8 — Stop Tokens and Stop Sequences

- Generation ends when:
  1. The model generates an `EOS` (End of Sequence) token
  2. A configured stop sequence is encountered
  3. `max_new_tokens` is reached

```python
# Common stop tokens
EOS_TOKEN_ID = tokenizer.eos_token_id       # <|endoftext|>
PAD_TOKEN_ID = tokenizer.pad_token_id

# Stop sequences (for chat models)
stop_sequences = ["<|eot_id|>", "User:", "\n\n---"]

# Check during generation
if any(stop_seq in decoded_text for stop_seq in stop_sequences):
    break
```

- **Important**: different models use different EOS tokens
  - Llama 3: `<|eot_id|>` (end of turn)
  - GPT models: `<|endoftext|>`
  - Mistral: `</s>`

---

## Slide 9 — Prefill vs Decode: Performance Characteristics

```
PREFILL PHASE
  Input: 1000-token prompt
  Operation: Full transformer forward pass on all 1000 tokens
  Characteristic: COMPUTE-BOUND (many parallel matrix multiplications)
  Latency: 50–500ms for a 70B model
  Throughput: High — all tokens processed in one batch

DECODE PHASE
  Input: 1 new token per step
  Operation: Small matmul + KV cache lookup
  Characteristic: MEMORY-BANDWIDTH-BOUND (weights must be loaded from HBM)
  Latency: 20–100ms per token for a 70B model (A100)
  Throughput: Limited by memory bandwidth
```

**Implication**: increasing batch size helps decode more than prefill
- Batch=1 decode: most memory bandwidth wasted
- Batch=32 decode: weights loaded once, used 32 times → 32× better efficiency

---

## Slide 10 — The Roofline Model for LLM Inference

**Memory bandwidth vs compute throughput:**

```
Arithmetic Intensity = FLOPs / Bytes read from memory

For decode of 70B model:
  FLOPs per token ≈ 2 × 70B = 140 GFLOPs
  Bytes read      ≈ 140 GB (full model weights)
  Intensity       = 140G / 140G = ~1 FLOP/byte

A100 specs:
  Peak FP16 compute: 312 TFLOPs/s
  Memory bandwidth:  2 TB/s
  Compute roofline:  312T / 2T = 156 FLOPs/byte threshold

1 < 156 → batch=1 decode is MEMORY-BANDWIDTH-BOUND
          → all memory bandwidth, ~1/156 of compute used
```

- Solution: increase batch size to improve arithmetic intensity

---

## Slide 11 — Flash Attention at Inference

- Flash Attention doesn't just help training — critical for long-context inference
- Prefill with 128K context window: standard attention would need 128K × 128K attention matrix
  - = 16 billion elements × 2 bytes = **32 GB** just for attention scores!
- Flash Attention keeps this in SRAM, never materializes the full matrix

```python
# PyTorch 2.0+: automatically uses Flash Attention when available
import torch.nn.functional as F

# This dispatches to Flash Attention 2 on supported hardware
output = F.scaled_dot_product_attention(
    query, key, value,
    attn_mask=None,
    dropout_p=0.0,
    is_causal=True   # for decoder-only models
)
```

- Flash Attention 2: 2–4× faster than standard attention
- Flash Attention 3 (H100-specific): further 2× speedup with async pipelines

---

## Slide 12 — Quantization for Inference: INT8

- Reduce weight precision to save memory and speed up compute
- **Post-Training Quantization (PTQ)**: quantize after training, no retraining

**INT8 Weight Quantization (W8A16):**
```
For each weight tensor W:
  scale = max(|W|) / 127
  W_int8 = round(W / scale).clamp(-128, 127)

At inference:
  output = (W_int8.float() * scale) @ input_fp16
```

- Memory: 70B model fp16 = 140 GB → INT8 = 70 GB
- Speed: ~1.5–2× faster on A100 due to reduced memory bandwidth
- Quality: nearly lossless for most tasks (< 0.5% benchmark degradation)

---

## Slide 13 — INT4 Quantization (GPTQ, AWQ)

**GPTQ (Frantar et al., 2022)**:
- Quantize one layer at a time, compensate errors in subsequent weights
- Uses Hessian information to minimize quantization error

**AWQ (Lin et al., 2023)** (Activation-aware Weight Quantization):
- Observe which weights are most important by looking at activation magnitudes
- Scale important weights before quantization to preserve accuracy

```python
from awq import AutoAWQForCausalLM

model = AutoAWQForCausalLM.from_pretrained("meta-llama/Llama-2-70b-hf")
model.quantize(tokenizer, quant_config={
    "zero_point": True,
    "q_group_size": 128,
    "w_bit": 4,          # 4-bit weights
    "version": "GEMM"
})
# 70B model → 35 GB (fits on 2×A100 instead of 4×A100!)
```

---

## Slide 14 — Quantization Comparison

| Method | Bits | Memory (70B) | Perplexity Loss | Speed |
|--------|------|-------------|----------------|-------|
| FP16 | 16 | 140 GB | Baseline | 1× |
| INT8 | 8 | 70 GB | +0.3% | 1.5× |
| GPTQ W4A16 | 4 | 35 GB | +1.2% | 2× |
| AWQ W4A16 | 4 | 35 GB | +0.8% | 2.2× |
| GGUF Q4_K_M | ~4.5 | ~38 GB | +0.9% | 2× |
| GGUF Q2_K | ~2.5 | ~22 GB | +8% | 3× |

- **Rule of thumb**: W4A16 (4-bit weights, 16-bit activations) is the sweet spot
- For edge/mobile: GGUF Q4_K_M with llama.cpp
- For datacenter: AWQ or GPTQ with TensorRT-LLM

---

## Slide 15 — Speculative Decoding

**Problem**: decode is slow because we can only generate 1 token per step
**Insight**: use a small draft model to propose multiple tokens, then verify in parallel

```
Algorithm:
  1. Draft model (e.g., 7B) generates K tokens speculatively
  2. Target model (e.g., 70B) verifies all K tokens in ONE forward pass
  3. Accept tokens up to the first mismatch
  4. Resample the diverging token from the target distribution
  5. Repeat

Expected speedup:
  If acceptance rate α = 0.8 and K = 5:
  Expected accepted tokens per target step = K × α / (1 - α^K) ≈ 3.4
  → ~3.4× speedup with only ~10% quality impact
```

- Used in production by Google (SpecInfer), Anthropic (Claude fast mode)

---

## Slide 16 — Speculative Decoding: PyTorch Implementation

```python
def speculative_decode(draft_model, target_model, input_ids,
                       K=5, max_new_tokens=100):
    generated = []
    while len(generated) < max_new_tokens:
        # Step 1: Draft model generates K candidate tokens
        draft_tokens = []
        draft_probs = []
        draft_input = input_ids
        for _ in range(K):
            logits = draft_model(draft_input)[:, -1, :]
            probs = F.softmax(logits, dim=-1)
            token = torch.multinomial(probs, 1)
            draft_tokens.append(token)
            draft_probs.append(probs)
            draft_input = torch.cat([draft_input, token], dim=1)

        # Step 2: Target model verifies all K+1 positions at once
        candidate = torch.cat([input_ids] + draft_tokens, dim=1)
        target_logits = target_model(candidate)
        target_probs = F.softmax(target_logits[:, -K-1:-1, :], dim=-1)

        # Step 3: Accept/reject each token
        n_accepted = 0
        for i in range(K):
            r = torch.rand(1)
            acceptance = target_probs[:, i, draft_tokens[i]] / draft_probs[i][:, draft_tokens[i]]
            if r < acceptance.clamp(max=1.0):
                generated.append(draft_tokens[i])
                n_accepted += 1
            else:
                break  # Stop at first rejection
        input_ids = candidate[:, :len(input_ids[0]) + n_accepted + 1]
    return torch.cat(generated, dim=1)
```

---

## Slide 17 — Continuous Batching

**Static batching problem**:
- Requests in a batch have different lengths
- Must pad to the longest sequence → wasted compute
- Must wait for the longest request before starting new ones

**Continuous batching** (vLLM's approach):
- Requests enter and leave the batch dynamically, iteration by iteration
- When one sequence finishes, a new one fills its slot immediately
- No waiting for the slowest request in the batch

```
Static batch:  [AAAA____] [BB______] [CCCCCCCC]
               → wait for C before starting new requests

Continuous:    [AAAA|EE__] iteration 4: A done, start E
               [BB|FFFFFF] iteration 2: B done, start F
               [CCCCCCCC_] iteration 8: C done, start G
```

- **2–23× throughput improvement** over static batching (vLLM paper)

---

## Slide 18 — PagedAttention

- **Problem**: KV cache grows unpredictably during generation
  - Pre-allocating max_seq_len per request wastes 60–80% of memory
  - Memory fragmentation prevents fitting more requests

- **PagedAttention** (Kwon et al., 2023): inspired by OS virtual memory
  - Divide KV cache into fixed-size **blocks** (pages), e.g., 16 tokens per block
  - Store pages non-contiguously in GPU memory
  - Maintain a **block table** mapping logical → physical pages per request

```
Request 1: [block 0] [block 3] [block 7]  ← non-contiguous
Request 2: [block 1] [block 4]
Request 3: [block 2] [block 5] [block 6] [block 8]
           ↑ blocks allocated on demand, freed when done
```

- Near-zero KV cache memory waste (< 4%)
- Foundation of **vLLM** — the dominant open-source LLM serving system

---

## Slide 19 — vLLM: Production LLM Serving

```python
from vllm import LLM, SamplingParams

# Initialize once — loads model, sets up PagedAttention
llm = LLM(
    model="meta-llama/Llama-2-70b-chat-hf",
    tensor_parallel_size=4,    # 4 GPUs
    gpu_memory_utilization=0.9,
    max_model_len=4096,
)

# Process a batch of requests
prompts = [
    "Explain black holes in simple terms",
    "Write a Python quicksort implementation",
    "What is the capital of France?",
]
params = SamplingParams(temperature=0.7, top_p=0.9, max_tokens=512)
outputs = llm.generate(prompts, params)

for output in outputs:
    print(f"Prompt: {output.prompt[:50]}...")
    print(f"Output: {output.outputs[0].text[:100]}...")
```

---

## Slide 20 — Tensor Parallelism for Inference

- Split individual weight matrices across multiple GPUs
- Each GPU computes a shard of each layer's output

```
Without tensor parallelism (1 GPU):
  x (batch, seq, d_model) × W (d_model, 4*d_model)
  → output (batch, seq, 4*d_model)
  Requires: 4*d_model columns of W in one GPU

With tensor parallelism (4 GPUs):
  GPU 0: x × W[:, 0:d_model]     → partial output 0
  GPU 1: x × W[:, d_model:2*d_model] → partial output 1
  GPU 2: x × W[:, 2*d_model:3*d_model] → partial output 2
  GPU 3: x × W[:, 3*d_model:4*d_model] → partial output 3
  AllReduce → concat → final output
```

- Megatron-LM style: shard attention heads across GPUs
- vLLM supports tensor parallelism via `tensor_parallel_size` parameter
- Best for large models that don't fit on one GPU

---

## Slide 21 — Pipeline Parallelism for Inference

- Split model **layers** across GPUs
- GPU 0: layers 0–19, GPU 1: layers 20–39, etc.

```
Micro-batch 1: GPU0 → GPU1 → GPU2 → GPU3
Micro-batch 2:       GPU0 → GPU1 → GPU2 → GPU3
Micro-batch 3:             GPU0 → GPU1 → GPU2 → GPU3
```

- **Bubble** problem: GPUs idle while waiting for pipeline to fill
- Better for throughput than latency
- Used by DeepSpeed, Megatron-LM for very large models (500B+)
- **Combination**: 3D parallelism = data + tensor + pipeline

---

## Slide 22 — Prefill/Decode Disaggregation

**New architecture trend (2024):**
- Separate prefill and decode onto different machines
- **Prefill is compute-bound** → run on GPUs optimized for compute
- **Decode is memory-bandwidth-bound** → run on GPUs with high memory bandwidth

```
Client Request
      ↓
[Prefill Server(s)]           [Decode Server(s)]
  H100 SXM5                    A100 HBM3
  High FLOP/s                  High BW/s
  Process prompt in batch      Generate tokens
        ↓  (transfer KV cache)       ↓
      [Load Balancer / Router]
```

- Disaggregation improves overall GPU utilization by 30–50%
- Used by: Mooncake (Moonshot AI), DistServe

---

## Slide 23 — Quantization for Inference: FP8

- H100 GPUs have native **FP8** (Float8) Tensor Core support
- Two FP8 formats: E4M3 (for weights) and E5M2 (for gradients/activations)
- Enables **W8A8 quantization** with full hardware acceleration

```python
# Using TensorRT-LLM with FP8
import tensorrt_llm

# Convert to FP8 with calibration
builder = tensorrt_llm.Builder()
config = builder.create_builder_config(
    precision="fp8",
    calibrate_with=calibration_dataset
)

# Build the engine
engine = builder.build_engine(model, config)
# Result: ~2× memory savings vs fp16, ~2× faster compute
```

- FP8 vs INT8: FP8 better preserves outliers in activations
- Used by: Llama 3 production serving at Meta

---

## Slide 24 — GGUF and llama.cpp

- Run LLMs **locally** on CPU (or Apple Silicon MPS)
- GGUF format: quantized model packed into a single file

```bash
# Install llama.cpp
git clone https://github.com/ggerganov/llama.cpp
make -j8 LLAMA_METAL=1  # for Apple Silicon GPU acceleration

# Download a quantized model
wget https://huggingface.co/TheBloke/Llama-2-7B-GGUF/resolve/main/llama-2-7b.Q4_K_M.gguf

# Run inference
./llama-cli -m llama-2-7b.Q4_K_M.gguf \
            -p "Explain transformer attention:" \
            -n 200 -t 8 --temp 0.7
```

**Performance on Apple M3 Max:**
- Llama-2 7B Q4: ~50 tokens/sec
- Llama-2 13B Q4: ~30 tokens/sec
- Llama-2 70B Q4: ~8 tokens/sec (fits in 48GB unified memory)

---

## Slide 25 — TensorRT-LLM: NVIDIA's Inference Engine

```python
import tensorrt_llm
from tensorrt_llm import LLM as TrtLLM
from tensorrt_llm.llmapi import SamplingParams

# High-level API (2024+)
llm = TrtLLM(
    model="meta-llama/Meta-Llama-3-70B-Instruct",
    tensor_parallel_size=4,
    pipeline_parallel_size=1,
    dtype="bfloat16",
    # Enable optimizations
    enable_chunked_prefill=True,
    kv_cache_config={"free_gpu_memory_fraction": 0.9},
)

sampling_params = SamplingParams(temperature=0.8, top_p=0.95)
output = llm.generate(["What is quantum computing?"], sampling_params)
```

**Key TRT-LLM optimizations:**
- Fused CUDA kernels for attention, LayerNorm, RoPE
- In-flight batching (similar to continuous batching)
- FP8/INT8 quantization with calibration
- Speculative decoding support

---

## Slide 26 — Latency vs Throughput Tradeoff

```
LATENCY (Time to first token, Time per output token)
  Goal: minimize time for a single user
  Strategy: small batch sizes, model parallelism, fast hardware

THROUGHPUT (Tokens per second, Requests per second)
  Goal: maximize total output across all users
  Strategy: large batches, continuous batching, efficient kernels

                     ┌───────────────────────────────┐
                     │   THE SERVING TRADEOFF         │
Latency (ms/token) ↑ │  ●                             │
                     │     ●                           │
                     │        ●  ●                     │
                     │              ●  ●               │
                     │                    ●  ●  ●      │
                     └───────────────────────────────→ │
                          Throughput (tokens/s)
```

- SLAs (Service Level Agreements): P50/P90/P99 latency targets
- Interactive chat: P50 < 200ms time-to-first-token
- Background tasks: throughput maximization is fine

---

## Slide 27 — Memory Management During Inference

**GPU memory breakdown for 70B inference:**

```
Total GPU memory: 80 GB (A100) × 4 = 320 GB

Model weights (FP16):         ~140 GB
Activation buffers:           ~2–5 GB
KV cache (dynamic):           ~100 GB (fills up to 80% of free memory)
Runtime overhead:             ~5 GB
──────────────────────────────────────
Available for KV cache:       ~170 GB
At 1.3 GB per 4K seq:         ~130 concurrent 4K sequences
```

**Memory optimization techniques:**
1. Use INT4/INT8 quantization: weight memory → 35–70 GB
2. Use GQA: KV cache → 8× smaller
3. Page eviction: evict cold KV cache pages to CPU RAM
4. Context window sliding: only keep recent K tokens in cache

---

## Slide 28 — Inference with PyTorch: End-to-End

```python
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

model_id = "meta-llama/Meta-Llama-3-8B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(model_id)

# Load with BF16 and Flash Attention 2
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.bfloat16,
    device_map="auto",             # automatic multi-GPU placement
    attn_implementation="flash_attention_2",
)
model.eval()

# Inference
messages = [{"role": "user", "content": "Explain attention mechanisms"}]
input_ids = tokenizer.apply_chat_template(
    messages, return_tensors="pt"
).to(model.device)

with torch.inference_mode():   # faster than no_grad, disables autograd
    output = model.generate(
        input_ids,
        max_new_tokens=512,
        do_sample=True,
        temperature=0.7,
        top_p=0.9,
        use_cache=True,        # enables KV cache
    )

print(tokenizer.decode(output[0][input_ids.shape[1]:]))
```

---

## Slide 29 — Inference with JAX: End-to-End

```python
import jax
import jax.numpy as jnp
from flax import linen as nn
from functools import partial

# JAX model forward pass
@jax.jit
def forward(params, input_ids, kv_cache):
    """Single autoregressive step with KV cache."""
    # Run transformer with cached KV
    logits, new_kv_cache = model.apply(
        params, input_ids, kv_cache=kv_cache
    )
    return logits[:, -1, :], new_kv_cache  # last token logits

# Sampling (JAX-style, PRNG key required)
def sample_token(logits, rng_key, temperature=0.7, top_p=0.9):
    logits = logits / temperature
    # Apply top-p sampling
    sorted_logits = jnp.sort(logits, axis=-1)[::-1]
    cumprobs = jax.nn.softmax(sorted_logits).cumsum(axis=-1)
    nucleus_mask = cumprobs < top_p
    filtered = jnp.where(nucleus_mask, sorted_logits, -jnp.inf)
    probs = jax.nn.softmax(filtered)
    return jax.random.categorical(rng_key, jnp.log(probs))

# JIT-compiled generation loop
@partial(jax.jit, static_argnums=(3,))
def generate_step(params, input_ids, kv_cache, temperature):
    logits, new_kv = forward(params, input_ids, kv_cache)
    rng = jax.random.PRNGKey(0)
    next_token = sample_token(logits, rng, temperature)
    return next_token, new_kv
```

---

## Slide 30 — JAX TPU Inference: Scaling Up

```python
import jax
from jax.experimental import mesh_utils
from jax.sharding import Mesh, PartitionSpec as P

# Create a 4×2 device mesh (4 TPUs × 2 for model parallelism)
devices = mesh_utils.create_device_mesh((4, 2))
mesh = Mesh(devices, axis_names=('data', 'model'))

# Shard model weights across the model axis
from jax.sharding import NamedSharding
weight_sharding = NamedSharding(mesh, P(None, 'model'))  # shard columns
act_sharding    = NamedSharding(mesh, P('data', None))   # shard batch

# JIT with sharding constraints
@jax.jit
def sharded_forward(params, x):
    with mesh:
        x = jax.lax.with_sharding_constraint(x, act_sharding)
        return model.apply(params, x)

# TPU v4 performance for Llama-2 70B:
# 1 TPU v4 pod (256 chips): ~10,000 tokens/sec
# Cost: ~$800/hr → ~$0.08 per 1000 tokens
```

---

## Slide 31 — Structured Output Generation

- Force the model to generate valid JSON, SQL, or any structured format
- **Constrained generation**: at each step, only allow tokens that form valid structure

```python
from outlines import models, generate

model = models.transformers("mistralai/Mistral-7B-v0.1")

# Force valid JSON output
schema = """{
    "name": {"type": "string"},
    "age": {"type": "integer"},
    "email": {"type": "string"}
}"""

generator = generate.json(model, schema)
result = generator("Extract info: John Smith, 30, john@example.com")
# Always returns: {"name": "John Smith", "age": 30, "email": "john@example.com"}

# Force choice between options
classifier = generate.choice(model, ["positive", "negative", "neutral"])
sentiment = classifier("The movie was surprisingly good!")
# Returns: "positive"
```

---

## Slide 32 — Function Calling and Tool Use

- Modern LLMs can be trained to output structured tool invocations
- The model generates a JSON function call; the runtime executes it and returns the result

```python
tools = [{
    "name": "get_weather",
    "description": "Get current weather for a location",
    "parameters": {
        "type": "object",
        "properties": {
            "location": {"type": "string", "description": "City name"},
            "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
        },
        "required": ["location"]
    }
}]

# Model response with tool call:
# {"tool": "get_weather", "parameters": {"location": "Paris", "unit": "celsius"}}

# Runtime executes the tool, feeds result back:
# "Current weather in Paris: 18°C, partly cloudy"
```

- Implemented via special training tokens and structured decoding
- Used in: GPT-4, Claude, Llama 3 with tools

---

## Slide 33 — Retrieval-Augmented Generation (RAG)

```
User Query: "What did Anthropic release in March 2024?"
                    ↓
           Embedding Model
                    ↓
         Query Vector (1536-dim)
                    ↓
    ┌──────────────────────────────┐
    │      Vector Database         │
    │  (Chroma, Pinecone, Weaviate)│
    │  cosine similarity search    │
    └──────────────────────────────┘
                    ↓
         Top-K relevant chunks
                    ↓
    Augmented Prompt = Query + Chunks
                    ↓
              LLM generates answer
              grounded in real docs
```

- Solves: hallucination, outdated knowledge, private data
- **Key optimization**: chunk size, embedding model, retrieval k value

---

## Slide 34 — KV Cache Sharing: Prefix Caching

- Many requests share the same system prompt (e.g., all use the same "You are a helpful assistant..." prefix)
- **Prefix caching**: compute and cache the KV states for the shared prefix once, reuse across requests

```
Without prefix caching:
  Request 1: [system_prompt (500 tokens)] + [user query 1]
  Request 2: [system_prompt (500 tokens)] + [user query 2]
  → Each request computes KV for 500 tokens redundantly

With prefix caching:
  First request: compute + cache KV for system_prompt
  Request 2+:    load cached KV → skip 500 token computation
  → 30-50% prefill cost reduction for chat applications
```

- vLLM's **automatic prefix caching**: enabled by default in v0.3+
- Especially valuable for long shared contexts (RAG documents, code files)

---

## Slide 35 — Inference Cost: The Real Numbers

**Cost per 1M output tokens (2024 pricing):**

| Provider & Model | Input | Output |
|-----------------|-------|--------|
| GPT-4o | $5 | $15 |
| GPT-4o mini | $0.15 | $0.60 |
| Claude 3.5 Sonnet | $3 | $15 |
| Claude 3 Haiku | $0.25 | $1.25 |
| Llama-3 70B (Groq) | $0.59 | $0.79 |
| Self-hosted A100×4 | ~$0.10–0.30 | ~$0.10–0.30 |

**Breaking even on self-hosting:**
- At >5M tokens/day, self-hosting often beats API pricing
- Capital cost: 4×A100 ≈ $60K–80K upfront
- Operational cost: electricity, bandwidth, engineering time

---

## Slide 36 — Inference Cost Optimization Strategies

**Reduce cost per token:**

1. **Quantization** (INT4): 2–4× cheaper, minimal quality loss
2. **Speculative decoding**: 2–3× faster decode at same quality
3. **Smaller model** (distillation): GPT-4o-mini vs GPT-4 — 25× cheaper
4. **Caching responses**: identical prompts → return cached response
5. **Batching**: fill GPU memory with requests → improve throughput

**Reduce tokens needed:**

6. **Better prompts**: fewer tokens in, fewer tokens out
7. **Early exit**: stop generation when confidence is high
8. **Context compression**: summarize history instead of full chat log
9. **Shorter system prompts**: every token costs money

---

## Slide 37 — Latency Optimization: Time to First Token (TTFT)

**Users notice TTFT more than generation speed**
- TTFT < 200ms: feels instantaneous
- TTFT 200ms–1s: noticeable but acceptable
- TTFT > 1s: frustrating

**How to minimize TTFT:**

1. **Speculative decoding**: not relevant — TTFT is prefill
2. **Chunked prefill**: process long prompts in chunks, start decoding earlier
3. **Prompt caching**: pre-compute K/V for system prompts
4. **Parallel prefill**: split long prompt across multiple GPUs
5. **Smaller model + distillation**: trade quality for latency
6. **Geographic proximity**: route to nearest datacenter

---

## Slide 38 — Streaming Responses

- Don't wait for complete generation — stream tokens as they're produced
- Users see output immediately, dramatically improves perceived responsiveness

```python
# Server-side streaming with HuggingFace
from transformers import TextIteratorStreamer
from threading import Thread

streamer = TextIteratorStreamer(tokenizer, skip_prompt=True)

# Run generation in a separate thread
thread = Thread(target=model.generate, kwargs={
    "input_ids": inputs,
    "max_new_tokens": 512,
    "streamer": streamer,
})
thread.start()

# Stream tokens as they're generated
for token_text in streamer:
    print(token_text, end="", flush=True)
    # In a web server: yield token via SSE (Server-Sent Events)
```

- **Server-Sent Events (SSE)**: standard HTTP streaming protocol used by OpenAI API
- WebSockets: better for bidirectional, real-time applications

---

## Slide 39 — Prompt Compression and Context Management

**Problem**: long conversations consume expensive tokens for full history
**Solution**: compress older conversation history

```python
def compress_history(conversation, model, max_tokens=500):
    """Summarize old conversation turns to save context space."""
    if count_tokens(conversation) < max_tokens:
        return conversation

    # Keep last 2 turns verbatim for continuity
    recent = conversation[-4:]  # last 2 user+assistant pairs
    older  = conversation[:-4]

    # Summarize older turns
    summary_prompt = f"Summarize this conversation in 3 sentences:\n{older}"
    summary = model.generate(summary_prompt, max_new_tokens=100)

    return [
        {"role": "system", "content": f"Previous context: {summary}"}
    ] + recent
```

- **LLMLingua**: use a small model to compress prompts by removing unimportant tokens
- **RAPTOR**: hierarchical summarization of long documents

---

## Slide 40 — Inference on Apple Silicon (Metal/MPS)

```python
import torch

# Check available backends
print(torch.backends.mps.is_available())  # True on M1/M2/M3 Mac

# Move model to Apple Silicon GPU
device = torch.device("mps")
model = model.to(device)

# Inference (same API as CUDA)
with torch.inference_mode():
    inputs = tokenizer(text, return_tensors="pt").to(device)
    output = model.generate(**inputs, max_new_tokens=200)
```

**Performance benchmarks (Apple M3 Max, 128GB):**
- Llama-2 7B Q4 (via llama.cpp): ~50 tok/s
- Llama-2 13B Q4: ~28 tok/s
- Llama-3 70B Q4: ~8 tok/s (fits in unified memory!)
- **Advantage**: no GPU VRAM limit — unified 128GB memory pool
- **Disadvantage**: ~3–5× slower than equivalent NVIDIA GPU

---

## Slide 41 — Multi-GPU Inference Setup

```python
# 4× A100 with automatic device mapping
from accelerate import infer_auto_device_map, init_empty_weights
from transformers import AutoConfig, AutoModelForCausalLM

config = AutoConfig.from_pretrained("meta-llama/Llama-2-70b-hf")

# Create empty model skeleton to compute device map
with init_empty_weights():
    model = AutoModelForCausalLM.from_config(config)

# Compute optimal device map
device_map = infer_auto_device_map(
    model,
    max_memory={0: "70GB", 1: "70GB", 2: "70GB", 3: "70GB"},
    dtype=torch.float16,
)

# Load with computed map
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-70b-hf",
    device_map=device_map,
    torch_dtype=torch.float16,
)
# Layers distributed across 4 GPUs automatically
```

---

## Slide 42 — Batched Inference for Throughput

```python
# Padding-aware batched inference
def batched_generate(model, tokenizer, prompts, batch_size=8):
    all_outputs = []

    for i in range(0, len(prompts), batch_size):
        batch = prompts[i : i + batch_size]

        # Tokenize with left-padding (so all sequences end aligned)
        tokenizer.padding_side = "left"
        inputs = tokenizer(
            batch,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=2048,
        ).to(model.device)

        with torch.inference_mode():
            outputs = model.generate(
                **inputs,
                max_new_tokens=256,
                pad_token_id=tokenizer.eos_token_id,
                do_sample=True,
                temperature=0.7,
            )

        # Decode only the newly generated tokens
        new_tokens = outputs[:, inputs.input_ids.shape[1]:]
        decoded = tokenizer.batch_decode(new_tokens, skip_special_tokens=True)
        all_outputs.extend(decoded)

    return all_outputs
```

---

## Slide 43 — Benchmarking Inference Performance

```python
import time, torch

def benchmark_inference(model, tokenizer, prompt, n_runs=10):
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    prompt_len = inputs.input_ids.shape[1]

    # Warmup
    with torch.inference_mode():
        model.generate(**inputs, max_new_tokens=10)

    torch.cuda.synchronize()
    times = []
    for _ in range(n_runs):
        start = time.perf_counter()
        with torch.inference_mode():
            out = model.generate(**inputs, max_new_tokens=100)
        torch.cuda.synchronize()
        times.append(time.perf_counter() - start)

    n_new_tokens = out.shape[1] - prompt_len
    avg_time = sum(times) / n_runs
    tokens_per_sec = n_new_tokens / avg_time

    print(f"Avg time: {avg_time*1000:.1f}ms")
    print(f"Tokens/sec: {tokens_per_sec:.1f}")
    print(f"Memory: {torch.cuda.memory_allocated()/1e9:.1f} GB")
    return tokens_per_sec
```

**Typical numbers (single A100 80GB):**
- 7B FP16: ~80–100 tokens/sec
- 7B INT4: ~150–200 tokens/sec
- 70B FP16 (4×A100): ~25–35 tokens/sec

---

## Slide 44 — LLM Serving Architecture in Production

```
                    ┌─────────────────┐
                    │   Load Balancer  │
                    │   (Nginx/Envoy)  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐   ┌──────────┐  ┌──────────┐
        │ vLLM Pod │   │ vLLM Pod │  │ vLLM Pod │
        │ 4×A100   │   │ 4×A100   │  │ 4×A100   │
        │ Llama-70B│   │ Llama-70B│  │ Llama-70B│
        └────┬─────┘   └────┬─────┘  └────┬─────┘
             │              │             │
        ┌────▼──────────────▼─────────────▼───┐
        │        Redis Cache (prompt cache)    │
        └──────────────────────────────────────┘
             │
        ┌────▼──────────────────────────────────┐
        │   Observability: Prometheus + Grafana  │
        │   Metrics: TTFT, TPS, error rate       │
        └───────────────────────────────────────┘
```

---

## Slide 45 — Evaluating LLM Inference Quality

**Offline benchmarks:**
- **MMLU**: 57 subjects, measures knowledge breadth
- **HumanEval**: 164 Python coding problems
- **GSM8K**: grade school math word problems
- **MATH**: competition mathematics
- **MT-Bench**: multi-turn conversation quality

```python
# Evaluate with lm-evaluation-harness
from lm_eval import evaluator

results = evaluator.simple_evaluate(
    model="hf",
    model_args="pretrained=meta-llama/Meta-Llama-3-8B-Instruct",
    tasks=["mmlu", "gsm8k", "humaneval"],
    num_fewshot=5,
    batch_size=8,
)
# Results:
# mmlu:      65.3%
# gsm8k:     75.1%
# humaneval: 62.2%
```

---

## Slide 46 — Edge Inference: Quantized Models on Mobile

**Frameworks for on-device LLM inference:**

| Framework | Targets | Key Feature |
|-----------|---------|-------------|
| llama.cpp | CPU, Metal, CUDA | C++, GGUF, widest model support |
| MLC-LLM | iOS, Android, WebGPU | Compiler-based, TVM backend |
| Ollama | macOS, Linux, Windows | Docker-like model management |
| ExLlamaV2 | CUDA only | Fastest GPU inference for quants |
| LM Studio | Desktop app | GUI for local LLMs |

```bash
# Ollama: simplest local LLM deployment
ollama run llama3:8b
# Automatically downloads, quantizes, and serves locally
# Chat at: http://localhost:11434/api/chat
```

---

## Slide 47 — Inference Cost vs Model Size Tradeoffs

```
Quality vs Cost vs Latency Triangle:

         Quality
            ▲
            │   GPT-4o ●
            │
            │      ● Claude 3.5 Sonnet
            │
            │         ● Llama-3 70B
            │
            │   ● Llama-3 8B
            │              ● GPT-4o mini
            │
            └────────────────────→
           Fast/Cheap        Slow/Expensive

Rule of thumb:
  • Simple extraction/classification: 7B–8B model
  • Reasoning and analysis: 70B model
  • Complex multi-step tasks: frontier model
  • Code generation: specialized model (CodeLlama, DeepSeek Coder)
```

---

## Slide 48 — The Future of LLM Inference

**Trends to watch:**

1. **Mixture of Experts (MoE)** at inference: activate only 2–4 experts per token
   → Mixtral 8×22B: quality of 70B at cost of 12B
   
2. **Speculative streaming**: draft model + streaming combined
   → Real-time audio-quality token generation

3. **Multimodal KV cache**: unified cache for text + image + audio tokens

4. **Flash Decoding**: parallelize attention across the KV cache sequence dimension

5. **Groq LPU** (Language Processing Unit): custom silicon for memory bandwidth
   → 500+ tokens/sec on Llama-2 70B

6. **In-context learning hardware**: dedicated SRAM for KV cache on-chip

---

## Slide 49 — Inference Summary: Key Principles

**The Five Laws of LLM Inference:**

1. **Decode is memory-bandwidth-bound** at batch size 1
   → Solution: quantize, batch requests, GQA

2. **KV cache is the dominant memory cost** for long contexts
   → Solution: PagedAttention, GQA, sliding window

3. **Prefill is compute-bound** for long prompts
   → Solution: Flash Attention, chunked prefill

4. **Latency and throughput trade off** — you can't optimize both simultaneously
   → Solution: continuous batching finds the best operating point

5. **The best model is the smallest one that meets your quality bar**
   → Evaluate first, over-provision compute last

---

## Slide 50 — The Complete LLM Journey: Training to Inference

```
DATA                    TRAINING                  INFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Trillions of     →  Pretraining      →  Quantize (INT4/FP8)
web tokens          (CLM loss)
                                     →  Serve with vLLM
10K–1M           →  SFT                 (PagedAttention
instruction          (instruction           + cont. batching)
pairs               following)
                                     →  Optimize with
Preference       →  DPO / RLHF           speculative decoding
pairs               (alignment)
                                     →  Monitor TTFT, TPS,
Harmful pairs    →  Safety SFT           cost per token
                    (refusals)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cost:  $1M–$100M          Cost: $0.0001–$0.015 / 1K tokens
Time:  Weeks–Months       Latency: 20–500ms
Once:  Train once          Always:  Serve forever
```

**You now understand the complete lifecycle of a Large Language Model.**

---

*End of Part 2 — LLM Inference (50 Slides)*

---

## Appendix: Quick Reference Card

### Key Formulas
- **KV Cache Memory**: `2 × layers × kv_heads × d_head × seq_len × dtype_bytes`
- **Model Memory (FP16)**: `params × 2 bytes`
- **Training Compute**: `~6 × N × D` FLOPs (N=params, D=tokens)
- **Arithmetic Intensity**: `FLOPs / bytes_accessed`

### Key Tools
- **Training**: PyTorch FSDP, DeepSpeed ZeRO, Megatron-LM
- **Fine-tuning**: HuggingFace PEFT, TRL, Axolotl
- **Inference**: vLLM, TensorRT-LLM, llama.cpp, Ollama
- **Quantization**: bitsandbytes, AWQ, GPTQ, ExLlamaV2
- **Evaluation**: lm-eval-harness, HELM, OpenLLM Leaderboard
- **Monitoring**: Weights & Biases, TensorBoard, Prometheus

### Must-Read Papers
- *Attention Is All You Need* (2017) — Transformer architecture
- *Language Models are Few-Shot Learners* (2020) — GPT-3 scaling
- *Training Compute-Optimal LLMs* (2022) — Chinchilla laws
- *FlashAttention* (2022) — IO-aware attention
- *Direct Preference Optimization* (2023) — DPO alignment
- *Efficient Memory Management for LLM Serving* (2023) — PagedAttention
