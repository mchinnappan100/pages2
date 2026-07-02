Quantization is the process of reducing the numerical precision of an LLM's weights (and sometimes activations) from high-precision formats like FP32 or FP16 to lower-precision formats such as INT8, INT4, or even INT2. The goal is to make models smaller, faster, and more memory-efficient while preserving as much accuracy as possible.

## Why Quantize?

A model like Llama 3 or DeepSeek-R1 may require tens or hundreds of gigabytes of memory in FP16.

For example:

| Model |    FP16 |   INT8 |      INT4 |
| ----- | ------: | -----: | --------: |
| 7B    |  ~14 GB |  ~7 GB | ~3.5–4 GB |
| 13B   |  ~26 GB | ~13 GB | ~6.5–7 GB |
| 70B   | ~140 GB | ~70 GB |    ~35 GB |

A 7B model that doesn't fit on a laptop GPU in FP16 often runs comfortably after 4-bit quantization.

---

## How Quantization Works

Normally, weights are stored as floating-point numbers:

```
FP16:
0.3821
-1.728
2.941
...
```

Instead, they are approximated using integers.

Example:

```
Original:

0.38
-1.72
2.94

↓

INT8

24
-109
186
```

Along with these integers, a **scale factor** is stored:

```
real_value = integer × scale
```

For example

```
scale = 0.0158

24 × 0.0158 = 0.3792
```

which is very close to the original value.

---

## Common Numeric Formats

| Format | Bits | Typical Use            |
| ------ | ---: | ---------------------- |
| FP32   |   32 | Training               |
| FP16   |   16 | GPU inference/training |
| BF16   |   16 | Large-scale training   |
| INT8   |    8 | Fast inference         |
| INT4   |    4 | Consumer GPUs          |
| INT2   |    2 | Research               |
| FP8    |    8 | New AI accelerators    |

---

## Types of Quantization

### 1. Post-Training Quantization (PTQ)

The model is trained normally.

After training:

```
FP16 Model
      ↓
Quantization
      ↓
INT4 Model
```

Advantages:

* no retraining
* very fast
* widely used

Examples:

* GPTQ
* AWQ
* GGUF
* HQQ

---

### 2. Quantization-Aware Training (QAT)

During training, the network simulates quantization.

```
Training

FP16 weights
↓

simulate INT4

↓

update weights

↓

repeat
```

Advantages:

* better accuracy
* especially helpful for 2–4 bit models

Disadvantages:

* expensive
* requires retraining

---

## Weight vs Activation Quantization

There are two main targets:

### Weight Quantization

Only model weights are compressed.

```
Weights:
FP16 → INT4
```

Most popular.

---

### Activation Quantization

Intermediate outputs are also quantized.

```
Input

↓

Layer 1

↓

Activations

↓

INT8

↓

Layer 2
```

This saves even more memory but is harder to optimize.

---

## Popular Quantization Methods

### GPTQ

* One-shot post-training quantization
* Layer-by-layer optimization
* Very popular for inference

Works well for:

* 3-bit
* 4-bit
* 8-bit

---

### AWQ (Activation-Aware Weight Quantization)

Key idea:

Not all weights are equally important.

Protect weights that strongly affect activations while aggressively compressing the rest.

Benefits:

* higher accuracy than many older methods
* widely used for instruction-tuned models

---

### GGUF

Popular with:

* llama.cpp

Features:

* multiple quantization levels
* optimized CPU inference
* ideal for local execution

Common variants:

```
Q4_K_M
Q5_K_M
Q6_K
Q8_0
```

---

### BitsAndBytes

Common in Hugging Face Transformers.

Supports:

* 8-bit loading
* 4-bit loading
* NF4 quantization

Example:

```python
load_in_4bit=True
bnb_4bit_quant_type="nf4"
```

---

## NF4 (NormalFloat4)

Instead of equally spaced integers:

```
0
1
2
3
```

NF4 assumes neural network weights approximately follow a normal (Gaussian) distribution and allocates its 16 representable values more densely where weights are most common (near zero). This generally yields better accuracy than simple linear 4-bit quantization.

---

## Per-Tensor vs Per-Channel Quantization

### Per-Tensor

One scale for an entire tensor.

```
Entire matrix

↓

one scale
```

Simple but less accurate.

---

### Per-Channel

Each output channel gets its own scale.

```
Channel 1

scale1

Channel 2

scale2
```

More accurate and commonly used in modern methods.

---

## Accuracy Trade-offs

Typical impact:

| Precision | Accuracy Loss |
| --------- | ------------- |
| FP16      | None          |
| INT8      | Almost none   |
| INT4      | Small         |
| INT3      | Moderate      |
| INT2      | Significant   |

Many modern 4-bit methods lose only a small amount of accuracy on common benchmarks.

---

## Performance Benefits

Typical improvements include:

* **2–4× smaller** model size
* **Lower VRAM usage**
* **Higher inference throughput** (hardware dependent)
* **Lower power consumption**
* **Ability to run larger models on consumer hardware**

For example, a 13B model that needs ~26 GB in FP16 can often run in around 7 GB using an optimized 4-bit quantization method.

---

## When Should You Use Which?

| Scenario               | Recommendation      |
| ---------------------- | ------------------- |
| Maximum accuracy       | FP16/BF16           |
| GPU inference          | INT8 or AWQ         |
| Consumer GPUs          | GPTQ or AWQ (4-bit) |
| CPU inference          | GGUF                |
| Fine-tuning            | QLoRA (4-bit NF4)   |
| Mobile/edge deployment | INT4 or INT8        |

---

## Relationship to QLoRA

Quantization also enables efficient fine-tuning. QLoRA keeps the pretrained model frozen in 4-bit precision (typically NF4), while training only small low-rank adapter matrices. This dramatically reduces memory requirements, allowing fine-tuning of large models on a single consumer GPU.

---

### Summary

Think of quantization like compressing a high-resolution image:

* **FP16** is like the original image.
* **INT8** is similar to a high-quality JPEG—much smaller with little visible loss.
* **INT4** is a more aggressive compression that usually remains very usable for inference.
* **INT2** is heavy compression, often causing noticeable degradation.

Modern techniques such as **AWQ**, **GPTQ**, **GGUF**, and **NF4** have made 4-bit quantization practical enough that many local LLM deployments achieve performance close to their FP16 counterparts while using a fraction of the memory.
