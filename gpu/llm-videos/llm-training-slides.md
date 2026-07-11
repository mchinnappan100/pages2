# LLM Training — 50 Slides
### From Transformer Architecture to Post-Training
**YouTube Presentation Deck · Part 1 of 2**

---

## Slide 1 — What is a Large Language Model?

- A **Large Language Model (LLM)** is a neural network trained to predict the next token in a sequence
- Trained on hundreds of billions of tokens from the internet, books, and code
- Scale is the key ingredient: billions of parameters + massive data + enormous compute
- Examples: GPT-4, Claude, Llama 3, Gemini, Mistral

> **Core idea:** Given a sequence of words, predict what comes next — billions of times over, until the model learns language itself.

---

## Slide 2 — Why Transformers Changed Everything

- Before Transformers (2017): RNNs and LSTMs processed tokens **sequentially** — slow, can't parallelize
- Transformers process **all tokens in parallel** using the attention mechanism
- Enables training on orders-of-magnitude more data
- The paper: *"Attention Is All You Need"* (Vaswani et al., 2017)

```
RNN:  token₁ → token₂ → token₃ → token₄   (sequential, slow)
Transformer: [token₁, token₂, token₃, token₄]  (parallel, fast)
```

---

## Slide 3 — The Transformer Architecture Overview

```
Input Text
    │
    ▼
Tokenizer → Token IDs
    │
    ▼
Token Embeddings + Positional Encoding
    │
    ▼
┌─────────────────────────────┐
│  Transformer Block × N      │
│  ┌─────────────────────┐    │
│  │ Multi-Head Attention │    │
│  │ + Residual + LayerNorm│  │
│  ├─────────────────────┤    │
│  │ Feed-Forward Network │    │
│  │ + Residual + LayerNorm│  │
│  └─────────────────────┘    │
└─────────────────────────────┘
    │
    ▼
Linear + Softmax → Probability over vocabulary
```

---

## Slide 4 — Tokenization: Text to Numbers

- LLMs don't see words — they see **token IDs**
- **Byte Pair Encoding (BPE)**: merge frequent character pairs into subword tokens
- Vocabulary size: typically **32K – 100K** tokens
- Example (GPT-4 tokenizer):
  - `"Hello world"` → `[9906, 1917]`
  - `"transformer"` → `[47278]` (one token)
  - `"supercalifragilistic"` → `[super, cal, if, rag, ilistic]` (5 tokens)

> Shorter tokens = more context in the window. Tokenizer quality matters!

---

## Slide 5 — Token Embeddings

- Each token ID maps to a **dense vector** of dimension `d_model`
- GPT-2: `d_model = 768`, Llama-2 70B: `d_model = 8192`
- The embedding matrix has shape: `(vocab_size × d_model)`
- For Llama-2 70B: `32000 × 8192 = 262M parameters` in the embedding alone
- Similar tokens end up **close together** in embedding space after training

```python
import torch.nn as nn
embedding = nn.Embedding(vocab_size=32000, d_model=4096)
# token_ids shape: (batch, seq_len)
# output shape:   (batch, seq_len, d_model)
```

---

## Slide 6 — Positional Encoding

- Attention has **no notion of order** — we must inject position information
- Three main approaches:

| Method | Used In | Key Idea |
|--------|---------|----------|
| Sinusoidal (fixed) | Original Transformer | sin/cos at different frequencies |
| Learned Absolute | BERT, GPT-2 | Trainable position vectors |
| RoPE (Rotary) | Llama, GPT-NeoX | Rotate Q/K by position angle |

- **RoPE** is now the dominant choice — it enables length extrapolation and generalizes better
- ALiBi adds position bias directly to attention logits (no embedding modification)

---

## Slide 7 — Scaled Dot-Product Attention

$$\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

- **Q (Query)**: What am I looking for?
- **K (Key)**: What do I contain?
- **V (Value)**: What do I return if matched?
- Dividing by `√d_k` prevents softmax from saturating in high dimensions
- Output: a **weighted sum of values**, weighted by attention scores

```python
import torch, math
def attention(Q, K, V, mask=None):
    d_k = Q.size(-1)
    scores = Q @ K.transpose(-2, -1) / math.sqrt(d_k)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    return scores.softmax(dim=-1) @ V
```

---

## Slide 8 — Multi-Head Attention

- Run attention **h times in parallel** with different learned projections
- Each head can attend to different aspects: syntax, semantics, coreference
- Concatenate outputs, project back to `d_model`

```
MHA(Q, K, V) = Concat(head₁, ..., headₕ) Wᴼ

headᵢ = Attention(Q Wᵢᵠ, K Wᵢᴷ, V Wᵢᵛ)
```

- Typical config (Llama-2 70B): `h = 64` heads, `d_k = d_model/h = 128`
- GQA (Grouped Query Attention): share K/V across groups of Q heads → reduces KV cache

---

## Slide 9 — Feed-Forward Network (FFN)

- Applied **position-wise** (independently to each token)
- Two linear layers with a non-linearity in between
- Inner dimension is `4 × d_model` (or `8/3 × d_model` for SwiGLU)

```python
class FFN(nn.Module):
    def __init__(self, d_model, d_ff):
        super().__init__()
        self.w1 = nn.Linear(d_model, d_ff)
        self.w2 = nn.Linear(d_ff, d_model)
        self.act = nn.GELU()  # or SiLU for SwiGLU

    def forward(self, x):
        return self.w2(self.act(self.w1(x)))
```

- **SwiGLU** (used in Llama, PaLM): `FFN(x) = (W₁x ⊙ σ(W₃x)) W₂` — gating mechanism improves quality

---

## Slide 10 — Residual Connections & Layer Norm

- **Residual connection**: `output = x + Sublayer(x)`
  - Prevents vanishing gradients in deep networks
  - Enables gradients to flow directly through the "highway"

- **Layer Normalisation**: normalizes across feature dimension per token
  - **Pre-Norm** (Llama, GPT-2 variants): `x + Sublayer(LayerNorm(x))` — more stable
  - **Post-Norm** (original Transformer): `LayerNorm(x + Sublayer(x))` — can be unstable at init

- **RMSNorm** (Llama): skip mean subtraction, only scale — faster, same quality

```python
class RMSNorm(nn.Module):
    def forward(self, x):
        return x * torch.rsqrt(x.pow(2).mean(-1, keepdim=True) + 1e-6) * self.weight
```

---

## Slide 11 — Encoder vs Decoder: The Two Flavors

| Architecture | Attention Mask | Examples | Best For |
|---|---|---|---|
| **Encoder-only** | Bidirectional (sees all tokens) | BERT, RoBERTa | Classification, NLU |
| **Decoder-only** | Causal (left-to-right only) | GPT, Llama, Claude | Generation |
| **Encoder-Decoder** | Encoder: full; Decoder: causal | T5, BART | Translation, Summarization |

> Modern LLMs are almost all **decoder-only** — simpler, scales better, great for generation and prompting.

---

## Slide 12 — The Encoder: Bidirectional Understanding

```
Input:  "The cat sat on the [MASK]"
         ↓   ↓   ↓   ↓    ↓    ↓
       [ token embeddings + position ]
                    ↓
         [ Multi-Head Attention ]
         ← Each token attends to ALL other tokens →
                    ↓
         [ Feed-Forward ]
                    ↓
       [ Rich contextual representations ]
```

- BERT's key insight: **masked language modeling** — predict masked tokens using full context
- Excellent for understanding tasks: NER, sentiment, QA, semantic similarity
- **NOT used for text generation** — no causal mask means it knows the future

---

## Slide 13 — The Causal Mask (Decoder)

- Decoders must **not look at future tokens** during training (would be cheating)
- Implemented by masking the upper triangle of the attention matrix to `-∞`

```
           t₁  t₂  t₃  t₄
      t₁ [ 1   0   0   0 ]   ← t₁ sees only itself
      t₂ [ 1   1   0   0 ]   ← t₂ sees t₁, t₂
      t₃ [ 1   1   1   0 ]   ← t₃ sees t₁, t₂, t₃
      t₄ [ 1   1   1   1 ]   ← t₄ sees all

     (0 → set logit to -∞ before softmax)
```

- At inference: generate one token at a time, always left-to-right
- Teacher forcing during training: feed the ground-truth previous tokens

---

## Slide 14 — Encoder-Decoder (Seq2Seq)

```
Source: "Translate: Hello world"
    ↓
[Encoder]  (bidirectional attention over full source)
    ↓ encoder hidden states
[Decoder]  (causal attention over generated output)
    +       (cross-attention to encoder states)
    ↓
"Bonjour monde"
```

- Decoder has **two attention layers** per block:
  1. Self-attention (causal, over generated tokens so far)
  2. Cross-attention (Q from decoder, K/V from encoder output)
- Ideal for fixed input→output transformations

---

## Slide 15 — Why Decoder-Only Won

- **Simpler**: one unified architecture for both understanding and generation
- **Scales better**: emergent abilities appear as model/data scales
- **In-context learning**: few-shot examples fit naturally in the context window
- **No encoder bottleneck**: full context length available throughout

> GPT-3 (2020) demonstrated that a decoder-only model could do translation, summarization, QA, coding — without task-specific fine-tuning. This changed everything.

---

## Slide 16 — Context Window & KV Cache (Preview)

- **Context window**: max number of tokens the model can process at once
  - GPT-2: 1024 tokens → GPT-4: 128K tokens → Gemini 1.5: 1M tokens
- **KV Cache**: during generation, cache the K and V matrices for all past tokens
  - Avoid recomputing for every new token — critical for fast inference
  - Memory: `2 × n_layers × n_heads × d_head × seq_len × bytes_per_param`

```
Step 1: generate token 1 (process full prompt)
Step 2: generate token 2 (use cached K/V, only compute new token)
Step 3: generate token 3 (use cached K/V, only compute new token)
         ↑ This is what makes autoregressive generation feasible
```

---

## Slide 17 — Scaling Laws: The Recipe for Performance

**Chinchilla Scaling Law** (Hoffmann et al., 2022):

$$L(N, D) = E + \frac{A}{N^\alpha} + \frac{B}{D^\beta}$$

- `N` = number of parameters, `D` = number of training tokens
- **Compute-optimal**: train on `~20 × N` tokens (Chinchilla ratio)
- GPT-3 (175B params) was **undertrained**: used ~300B tokens, should have used ~3.5T
- Llama 3 8B: trained on 15T tokens — deliberately over-trained for inference efficiency

> The insight: **a smaller model trained on more data beats a larger model trained on less data**, at the same compute budget.

---

## Slide 18 — Pretraining: The Big Picture

```
Phase 1: PRETRAINING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Data:    Trillions of tokens (web, books, code)
  Task:    Next-token prediction (causal LM)
  Goal:    Learn language, facts, reasoning patterns
  Cost:    Millions of $ in GPU compute
  Output:  "Base model" — knows a lot, not yet helpful
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase 2: POST-TRAINING (alignment)
  SFT → RLHF → RLAIF → DPO
  Cost: Much less — thousands of $ to millions
  Output: Helpful, harmless, honest assistant
```

---

## Slide 19 — Pretraining Data Pipeline

```
Raw Web Data (CommonCrawl, ~100 PB)
        ↓
   URL Filtering (remove spam, adult content)
        ↓
   Language Detection (keep English, etc.)
        ↓
   Deduplication (MinHash, exact match)
        ↓
   Quality Filtering (perplexity, heuristics)
        ↓
   Tokenization (BPE with sentencepiece)
        ↓
   Shuffled Token Shards (.bin files)
        ↓
   DataLoader → GPU training
```

- Quality > Quantity: FineWeb, RedPajama, The Pile
- Code data massively improves reasoning ability

---

## Slide 20 — The Pretraining Objective

**Causal Language Modeling (CLM) = next-token prediction**

Given tokens `[t₁, t₂, ..., tₙ]`, minimize:

$$\mathcal{L} = -\sum_{i=1}^{n} \log P(t_i \mid t_1, \ldots, t_{i-1})$$

- Equivalent to maximum likelihood estimation over the training corpus
- Self-supervised: **no labels needed** — the data itself is the label
- At every position, the model predicts the next token from the vocabulary
- With `vocab_size = 32000` and sequence length `4096`: the model makes `4096` predictions per forward pass

---

## Slide 21 — Pretraining Hardware Requirements

**Llama-2 70B training example:**
- Parameters: 70B × 2 bytes (BF16) = **140 GB** just for weights
- Optimizer states (AdamW): 2 × 140 GB = **280 GB** additional
- Gradients: 140 GB additional
- **Total per replica: ~560 GB** — requires sharding across many GPUs

| Model | Params | GPUs (A100 80GB) | GPU-hours | CO₂ |
|-------|--------|-----------------|-----------|-----|
| GPT-3 | 175B | ~1,024 A100 | ~355K | ~552 tons |
| Llama-2 70B | 70B | ~2,000 A100 | ~1.7M | ~291 tons |
| Llama-3 405B | 405B | ~16,000 H100 | ~7M+ | ~>1,000 tons |

---

## Slide 22 — Distributed Training: Why We Need It

- A single H100 (80 GB VRAM) can hold a ~20B parameter model in BF16
- Larger models require **model sharding** across multiple GPUs
- Three main parallelism strategies:

| Strategy | What's Split | Communication | Best For |
|---|---|---|---|
| **Data Parallel** | Batch | AllReduce gradients | Standard multi-GPU |
| **Tensor Parallel** | Weight matrices | AllReduce activations | Large layers |
| **Pipeline Parallel** | Model layers | Point-to-point | Very deep models |

- **3D parallelism**: all three combined (used for 100B+ models)

---

## Slide 23 — Data Parallelism & FSDP

**DistributedDataParallel (DDP)**:
- Each GPU holds a **full model copy**
- Each GPU processes a different mini-batch
- Gradients are AllReduced (averaged) across GPUs before the optimizer step

**Fully Sharded Data Parallel (FSDP)** = ZeRO Stage 3:
- Shards **parameters, gradients, AND optimizer states** across GPUs
- AllGather parameters before forward pass, then discard
- Dramatically reduces per-GPU memory — enables training 70B+ on commodity hardware

```python
from torch.distributed.fsdp import FullyShardedDataParallel as FSDP
model = FSDP(model, sharding_strategy=ShardingStrategy.FULL_SHARD)
```

---

## Slide 24 — Mixed Precision Training (BF16/FP16)

- Train in **BF16** (Brain Float 16) instead of FP32 — 2× memory savings, faster compute
- Maintain a **FP32 master copy** of weights for precise updates

```
Forward pass:   FP32 weights → cast to BF16 → compute
Loss:           computed in FP32
Backward pass:  gradients in BF16
Optimizer step: cast gradients to FP32, update FP32 master weights
```

- **Why BF16 over FP16?**
  - BF16: same exponent range as FP32 → no overflow
  - FP16: smaller exponent range → needs loss scaling hacks
  - Modern GPUs (A100+) have native BF16 Tensor Cores

---

## Slide 25 — The Training Loop (PyTorch)

```python
model = TransformerLM(config).to(device)
model = FSDP(model)  # or DDP
optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4,
                               weight_decay=0.1, betas=(0.9, 0.95))
scaler = torch.cuda.amp.GradScaler()

for step, batch in enumerate(dataloader):
    with torch.autocast(device_type='cuda', dtype=torch.bfloat16):
        logits = model(batch['input_ids'])
        loss = F.cross_entropy(
            logits.view(-1, vocab_size),
            batch['labels'].view(-1)
        )

    loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
    optimizer.step()
    scheduler.step()
    optimizer.zero_grad()
```

---

## Slide 26 — Learning Rate Schedule

- **Warmup** then **cosine decay** is standard for LLM pretraining

```
LR
▲
│    /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
│   /                       \
│  /                         \__________
│ /
└──────────────────────────────────────→ steps
   warmup     cosine decay        min LR
```

- Warmup: 1000–4000 steps (prevents large updates with random weights)
- Peak LR: 1e-4 to 3e-4 for most LLMs
- Min LR: typically 10% of peak
- **Gradient clipping** at 1.0 prevents exploding gradients

---

## Slide 27 — Gradient Checkpointing

- Normal training: store **all activations** in memory for backprop → huge memory cost
- **Gradient checkpointing**: recompute activations during backward pass instead of storing them

```
Normal:  Forward (store all) → Backward (read stored activations)
         Memory: O(n_layers × seq_len × d_model)

Checkpointed: Forward (store only checkpoints) → 
              Backward (recompute from checkpoints on the fly)
              Memory: O(√n_layers × seq_len × d_model)
              Cost: ~33% extra compute, 10× memory savings
```

```python
from torch.utils.checkpoint import checkpoint
# Wrap transformer block:
output = checkpoint(transformer_block, x)
```

---

## Slide 28 — Flash Attention: Making Attention Scalable

**Problem**: Standard attention materializes the N×N score matrix → O(N²) memory
**Solution**: Flash Attention (Dao et al., 2022)

- Tiles the computation into SRAM-friendly blocks
- Never materializes the full N×N matrix in HBM
- **Same mathematical output**, but:
  - Memory: O(N) instead of O(N²)
  - Speed: 2-4× faster due to reduced HBM reads/writes

```python
# PyTorch 2.0+ has built-in Flash Attention:
with torch.backends.cuda.sdp_kernel(enable_flash=True):
    output = F.scaled_dot_product_attention(Q, K, V, is_causal=True)
```

- Flash Attention 3 (H100-optimized): achieves >75% GEMM FLOP utilization

---

## Slide 29 — Model Checkpointing During Pretraining

- Save model weights periodically — training can take weeks
- Checkpoint every 1,000–5,000 steps
- Separate **model weights** from **optimizer state** (optimizer state is 2× larger)

```python
# Saving
torch.save({
    'step': step,
    'model_state': model.state_dict(),
    'optimizer_state': optimizer.state_dict(),
    'loss': loss,
}, f'checkpoint_step_{step}.pt')

# Resuming
ckpt = torch.load('checkpoint_step_10000.pt')
model.load_state_dict(ckpt['model_state'])
optimizer.load_state_dict(ckpt['optimizer_state'])
step = ckpt['step']
```

---

## Slide 30 — Cost of Pretraining LLMs

**GPU-hours formula:**
$$\text{GPU-hours} \approx \frac{6 \times N \times D}{\text{FLOP/s per GPU} \times \text{MFU}}$$

- `N` = parameters, `D` = tokens, MFU = model FLOP utilization (~40-50%)

| Model | Tokens | Cost (est.) |
|-------|--------|-------------|
| GPT-3 175B | 300B | ~$4.6M |
| Llama-2 70B | 2T | ~$2.4M |
| Llama-3 70B | 15T | ~$18M |
| GPT-4 (est.) | ~13T | ~$100M+ |

- H100 @ $3/hr: Llama-3 70B ≈ 6 million GPU-hours / $18M
- Biggest cost: **electricity + GPU amortization**, not just rental

---

## Slide 31 — Compute Budget and the "Chinchilla Cliff"

- Over-trained small models are **inference-efficient** — cheaper to serve
- Under-trained large models are **inference-expensive** — bigger per token

**Llama 3 design choice:**
- 8B model on 15T tokens (over-trained by Chinchilla)
- Result: an 8B model that outperforms the Chinchilla-optimal 70B
- At serving scale (millions of users), inference savings dwarf training costs

> Training is a one-time cost. Inference is a forever cost. Optimize for inference efficiency.

---

## Slide 32 — From Base Model to Assistant: Overview

```
Base Model (raw pretraining)
        ↓
   Supervised Fine-Tuning (SFT)
   → Human-written instruction-response pairs
        ↓
   Reward Model Training
   → Human preferences between model outputs
        ↓
   Reinforcement Learning from Human Feedback (RLHF)
   → PPO to maximize reward model score
        ↓
   Assistant Model (GPT-3.5, Claude, Llama-2-chat)
```

---

## Slide 33 — Supervised Fine-Tuning (SFT)

- Take the base model, fine-tune on **high-quality instruction-following data**
- Data format: `(system_prompt, user_message, ideal_response)` triplets
- Typical dataset size: 10K–1M examples
- Standard cross-entropy loss on the response tokens only (not the prompt)

```
Input:  "Translate to French: Hello, how are you?"
Output: "Bonjour, comment allez-vous ?"

Input:  "Write a Python function to reverse a list."
Output: "def reverse_list(lst):\n    return lst[::-1]"
```

- **Instruction tuning** teaches the model to follow user intents
- Examples: Alpaca (52K), ShareGPT, OpenHermes, Dolly

---

## Slide 34 — Reinforcement Learning from Human Feedback (RLHF)

**The problem SFT alone doesn't solve:**
- SFT teaches imitation, not preference
- A model might generate plausible-sounding but incorrect or harmful outputs
- Humans can recognize a good response when they see it, but writing one is hard

**RLHF solution:**
1. Collect **human preference data**: show two model responses, ask which is better
2. Train a **reward model** to predict human preferences
3. Use **PPO** (Proximal Policy Optimization) to optimize the LLM to get higher rewards
4. Add a **KL penalty** to prevent the policy from diverging too far from SFT

---

## Slide 35 — The Reward Model

- A transformer model (often the SFT model) with a scalar head
- Input: `(prompt, response)` → Output: a single scalar reward score

```python
class RewardModel(nn.Module):
    def __init__(self, base_model):
        super().__init__()
        self.base = base_model
        self.value_head = nn.Linear(d_model, 1)

    def forward(self, input_ids, attention_mask):
        hidden = self.base(input_ids, attention_mask).last_hidden_state
        # Use the last token's representation
        reward = self.value_head(hidden[:, -1, :])
        return reward.squeeze(-1)
```

- Trained with **Bradley-Terry loss** on preference pairs:
  `L = -log σ(r_chosen - r_rejected)`

---

## Slide 36 — PPO Training Loop for RLHF

```
For each step:
  1. Sample prompts from dataset
  2. Policy model generates responses
  3. Reward model scores each response
  4. KL divergence penalty: -β × KL(policy ‖ reference)
  5. Advantage estimation (GAE)
  6. PPO update: maximize clipped objective

Total reward = R_reward_model - β × KL(π_θ ‖ π_ref)
```

- **β (KL coefficient)**: typically 0.01–0.05
  - Too small: reward hacking (model games the reward model)
  - Too large: model barely moves from SFT baseline
- PPO requires running 4 models simultaneously: policy, reference, reward, critic

---

## Slide 37 — Reward Hacking and Alignment Tax

**Reward hacking**: the model finds ways to get high reward scores without being genuinely helpful

Examples:
- Producing very long responses (if length correlates with reward)
- Using sycophantic language ("Great question!")
- Giving vague, non-committal answers (hard to rate as wrong)

**Alignment tax**: RLHF can slightly hurt raw capability metrics while improving helpfulness

**Mitigations:**
- Diverse reward models trained on different human raters
- Process reward models (reward each reasoning step, not just final answer)
- Constitutional AI (Claude's approach): self-critique and revision

---

## Slide 38 — RLAIF: RL from AI Feedback

- Instead of expensive human labeling, use **another AI as the judge**
- Claude's Constitutional AI: the model critiques and revises its own outputs
- Google's RLAIF paper: AI labels are competitive with human labels

```
RLAIF Pipeline:
  1. Generate two responses to a prompt
  2. Ask a strong AI judge: "Which response is better and why?"
  3. Use AI judgment as preference signal
  4. Train reward model on AI preferences
  5. Run RL as in RLHF

Benefits:
  - 100× cheaper than human labeling
  - More consistent (no rater disagreement)
  - Can generate feedback at scale
```

---

## Slide 39 — DPO: Direct Preference Optimization

**Problem with PPO**: complex, unstable, needs 4 models, sensitive to hyperparameters

**DPO (Rafailov et al., 2023)**: skip the reward model entirely, optimize preferences directly

$$\mathcal{L}_{DPO} = -\mathbb{E}\left[\log \sigma\!\left(\beta \log \frac{\pi_\theta(y_w|x)}{\pi_{ref}(y_w|x)} - \beta \log \frac{\pi_\theta(y_l|x)}{\pi_{ref}(y_l|x)}\right)\right]$$

- `y_w` = preferred response, `y_l` = dispreferred response
- No separate reward model needed!
- Simpler training, similar quality to PPO
- **Widely adopted**: Llama 3, Mistral, Zephyr, OpenHermes use DPO

---

## Slide 40 — Post-Training: The Full Modern Pipeline

```
Base Model (pretraining done)
        ↓
┌─────────────────────────────────────┐
│         POST-TRAINING               │
│                                     │
│  1. SFT on high-quality data        │
│     (instruction following)         │
│         ↓                           │
│  2. DPO / RLHF                      │
│     (preference alignment)          │
│         ↓                           │
│  3. Safety fine-tuning              │
│     (refuse harmful requests)       │
│         ↓                           │
│  4. Capability-specific SFT        │
│     (code, math, tool use)          │
└─────────────────────────────────────┘
        ↓
   Production Model (Claude, GPT-4, etc.)
```

---

## Slide 41 — Long Context Training

- Pretraining on short sequences, then extending context is more efficient
- **RoPE interpolation**: scale the position angle frequencies to handle longer sequences
- **YaRN** (Yet Another RoPE extensioN): better than naive interpolation
- **Needle-in-a-haystack**: test whether the model can retrieve info from any position in a long context

```
Context extension recipe:
  1. Pretrain at 4096 tokens (fast, efficient)
  2. SFT at 4096 tokens
  3. Continue training at 32768 tokens with YaRN
     (only ~1-5% of total compute budget)
  4. SFT at long context on synthetic long-context data
```

---

## Slide 42 — Mixture of Experts (MoE) — Training Aspect

- Instead of one FFN, use **N expert FFNs** — only K are activated per token
- Mixtral 8×7B: 8 experts, top-2 activated per token
  - Total params: 46.7B, but only ~12.9B active per forward pass
  
```python
class MoELayer(nn.Module):
    def __init__(self, d_model, n_experts=8, top_k=2):
        super().__init__()
        self.router = nn.Linear(d_model, n_experts)
        self.experts = nn.ModuleList([FFN(d_model) for _ in range(n_experts)])
        self.top_k = top_k

    def forward(self, x):
        scores = self.router(x).softmax(-1)
        topk_scores, topk_idx = scores.topk(self.top_k, dim=-1)
        output = sum(topk_scores[..., i:i+1] * self.experts[topk_idx[..., i]](x)
                     for i in range(self.top_k))
        return output
```

---

## Slide 43 — Training Instabilities and Fixes

**Common training instabilities:**

| Issue | Symptom | Fix |
|-------|---------|-----|
| Loss spike | NaN/Inf loss | Gradient clipping, lower LR |
| Attention sink | Model degrades mid-training | QK layer norm |
| Embedding collapse | All tokens map to same vector | Weight tying carefully |
| Exploding gradients | Loss → NaN | `clip_grad_norm_(model, 1.0)` |
| Dead neurons | Relu → all zeros | GELU/SwiGLU instead |

- **µP (Maximal Update Parametrization)**: automatically tune learning rates for width/depth
- **Loss spike mitigation**: rollback to last good checkpoint, reduce LR by 10%, resume

---

## Slide 44 — Training Monitoring with Weights & Biases

```python
import wandb

wandb.init(project="llm-pretraining", config={
    "model": "llama-7b", "lr": 3e-4, "tokens": "1T"
})

# Log every step
wandb.log({
    "train/loss": loss.item(),
    "train/perplexity": math.exp(loss.item()),
    "train/learning_rate": scheduler.get_last_lr()[0],
    "train/grad_norm": grad_norm,
    "train/tokens_per_sec": tokens_per_sec,
    "system/gpu_memory_gb": torch.cuda.memory_allocated() / 1e9,
})
```

**Key metrics to watch:**
- Loss curve (should decrease smoothly)
- Gradient norm (should stay stable, ~0.5-2.0)
- Tokens per second (GPU utilization proxy)
- Validation perplexity (generalization check)

---

## Slide 45 — Quantization — Why It Matters for Training

- FP32: 4 bytes/param → FP16/BF16: 2 bytes/param → INT8: 1 byte/param → INT4: 0.5 bytes/param
- **QLoRA** (Dettmers et al., 2023): fine-tune in 4-bit quantization
  - NF4 (Normal Float 4): 4-bit format optimized for normally-distributed weights
  - Double quantization: quantize the quantization constants
  - Fine-tune 65B model on a single 48GB GPU!

```python
from transformers import BitsAndBytesConfig

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
)
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-70b", quantization_config=bnb_config
)
```

---

## Slide 46 — LoRA: Low-Rank Adaptation

- Fine-tuning all 70B parameters is expensive
- **LoRA**: inject small trainable rank-r matrices into attention layers
- Only train A and B (rank-r), freeze the original weight W

$$W' = W + \Delta W = W + BA \quad \text{where } B \in \mathbb{R}^{d \times r},\; A \in \mathbb{R}^{r \times k}$$

```python
from peft import get_peft_model, LoraConfig

lora_config = LoraConfig(
    r=16,              # rank
    lora_alpha=32,     # scaling factor
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)
model = get_peft_model(base_model, lora_config)
# Trainable params: ~10M instead of 7B → 0.14% of total!
```

---

## Slide 47 — Instruction Dataset Quality vs Quantity

**Less is more (if quality is high):**

- LIMA (2023): 1,000 carefully curated examples matched GPT-4 on many benchmarks
- Alpaca: 52K GPT-generated instructions — good start but noisy
- OpenHermes 2.5: 1M diverse, high-quality synthetic examples

**Good instruction data characteristics:**
- Diverse task types (creative, factual, code, math, reasoning)
- Clear, unambiguous instructions
- Thorough, accurate responses
- No harmful or low-quality content
- Balanced across difficulty levels

---

## Slide 48 — Using JAX for Training: Key Concepts

```python
import jax
import jax.numpy as jnp
from flax import linen as nn

class TransformerBlock(nn.Module):
    d_model: int
    n_heads: int

    @nn.compact
    def __call__(self, x, training=False):
        # Multi-head attention
        attn_out = nn.MultiHeadDotProductAttention(
            num_heads=self.n_heads)(x, x)
        x = nn.LayerNorm()(x + attn_out)

        # FFN
        ff_out = nn.Dense(self.d_model * 4)(x)
        ff_out = nn.gelu(ff_out)
        ff_out = nn.Dense(self.d_model)(ff_out)
        return nn.LayerNorm()(x + ff_out)

# JAX advantage: jit, grad, vmap, pmap all composable
@jax.jit
def train_step(params, batch, optimizer_state):
    loss, grads = jax.value_and_grad(loss_fn)(params, batch)
    updates, new_state = optimizer.update(grads, optimizer_state)
    new_params = optax.apply_updates(params, updates)
    return new_params, new_state, loss
```

---

## Slide 49 — JAX vs PyTorch for LLM Training

| Aspect | PyTorch | JAX |
|--------|---------|-----|
| **Paradigm** | Imperative, dynamic | Functional, pure |
| **Compilation** | `torch.compile` (Dynamo) | `jax.jit` (XLA always) |
| **Distributed** | FSDP, DDP | `pmap`, `shard_map` |
| **Debugging** | Easy (eager by default) | Harder (functional style) |
| **TPU support** | Limited | Native (Google's choice) |
| **Ecosystem** | Massive (HuggingFace) | Growing (Flax, Optax) |
| **Used by** | Meta, Mistral, most OSS | Google, DeepMind |

- **JAX + Flax + Optax**: Google's stack for Gemini, PaLM training
- **PyTorch + HuggingFace**: dominant in open-source community

---

## Slide 50 — Training Summary: The Full Picture

```
Data Collection & Curation
         ↓
Tokenizer Training (BPE)
         ↓
Model Architecture Design
(layers, heads, d_model, FFN type)
         ↓
Pretraining on Trillions of Tokens
(CLM loss, AdamW, cosine LR, BF16)
         ↓
Supervised Fine-Tuning (SFT)
         ↓
Preference Alignment (DPO/RLHF)
         ↓
Safety Fine-Tuning
         ↓
Quantization (INT4/INT8 for deployment)
         ↓
✅ Production-Ready LLM
```

**Key numbers to remember:**
- Pretraining: 10T–15T tokens, millions of GPU-hours
- Post-training: 10K–1M examples, thousands of GPU-hours
- Quality of data > quantity of data

---

*End of Part 1 — LLM Training (50 Slides)*

**Next: Part 2 — LLM Inference (50 Slides)**
- Autoregressive generation, sampling strategies
- KV cache optimization, Flash Attention
- Quantization for inference, speculative decoding
- vLLM, TensorRT-LLM, serving infrastructure
- Cost analysis and optimization
