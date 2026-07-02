---
title: "JEPA Framework"
subtitle: "A Path Towards Autonomous Machine Intelligence"
author: "Based on Yann LeCun · OpenReview 2022"
theme: default
---

# JEPA Framework
## A Path Towards Autonomous Machine Intelligence

> *"The main questions are: how could machines learn to represent the world, reason, and plan?"*
> — Yann LeCun, 2022

**6 Modules · 4 Learning Paradigms · H-JEPA Hierarchical World Model**

---

## Why Current AI Falls Short

Despite spectacular successes — AlphaFold, GPT, DALL-E — we still lack:

- ❌ Level 5 self-driving cars
- ❌ Domestic robots
- ❌ Truly general virtual assistants

**The fundamental gap: common sense**

> LLMs have no understanding of physical reality — all knowledge comes from text.  
> Systems are brittle and specialised — they *"make stupid mistakes."*

---

## What Babies Can Do That AI Cannot

A human infant develops a rich world model **far more efficiently** than any AI:

| Milestone | Age |
|-----------|-----|
| Object permanence | Month 6 |
| Gravity, inertia, momentum | Month 10 |
| Generalises to new situations | Immediately |

**Key:** learned from **observation alone** — no labels, no rewards, no trial-and-error.

> Self-supervised learning provides ~**10⁵×** more bits of training signal per sample than supervised learning.

---

## The Blurry Prediction Problem

When a model predicts in **raw signal space** with multimodal targets:

```
Object could go LEFT  or  RIGHT
        ↓
Gradient descent averages both
        ↓
Blurry, ghostly, unrealistic output
```

**Root causes:**
- Stochasticity: many valid futures exist
- Limited perception: not all info is available

✅ **Solution:** Predict in **abstract representation space**, not pixel space.

---

## The Four Learning Paradigms

| Paradigm | Signal Efficiency | Key Problem |
|----------|------------------|-------------|
| Supervised | Low (~10 bits/sample) | Data-hungry, needs labels |
| Reinforcement | Very low | Billions of steps for simple tasks |
| **Self-supervised** | **High (~10⁵ bits/sample)** | **Central element for next AI revolution** |
| Model-based (world model) | High | Plan via differentiable simulation |

> SSL learns what information bits are **most predictable** from other parts.

---

## Why Probabilistic Models Are Intractable

**Word prediction** ✅ tractable — probability over a finite dictionary

**Video frame prediction** ❌ intractable:

```
∫ exp[−βE(y)] dy   over all possible frames
```

Computing the partition function in high-dimensional continuous space is **computationally intractable**.

✅ **Solution:** Use **Energy-Based Models (EBMs)** — assign scalar energy to (x, y) pairs without normalisation.

---

## The Six-Module Architecture

```
┌─────────────────────────────────────────────────┐
│              CONFIGURATOR                        │
│  Sets goals · weights modules · task-switching  │
└──────────────────┬──────────────────────────────┘
                   │ configures
    ┌──────────────┼──────────────────┐
    ▼              ▼                  ▼
┌────────┐  ┌──────────────┐  ┌───────────┐
│PERCEPT.│  │ WORLD MODEL  │  │   ACTOR   │
│raw→repr│  │ predict future│  │propose act│
└────┬───┘  └──────┬───────┘  └─────┬─────┘
     │              │                │
     └──────────────┴────────────────┘
                    │
              ┌─────▼──────┐    ┌──────────┐
              │    STM     │    │   COST   │
              │ world state│    │ evaluate │
              └────────────┘    └──────────┘
```

**All modules are fully differentiable — gradients flow without real-world action.**

---

## The Six Modules Explained

| Module | Role |
|--------|------|
| **Configurator** | Top-level controller: sets goals, modes, priorities |
| **Perception** | Raw sensory input → abstract compressed representation |
| **World Model** | Predicts future states given current state + action (H-JEPA) |
| **Cost** | Evaluates desirability: intrinsic cost + learned critic |
| **Actor** | Outputs action sequences via gradient descent or policy network |
| **Short-Term Memory** | Stores current world state estimate (working memory) |

---

## The Perception–Planning–Action Cycle

```
① Perception updates STM
        ↓
② Actor proposes candidate actions
        ↓
③ World Model rolls out predicted futures
        ↓
④ Cost module evaluates outcomes
        ↓
⑤ Gradients refine actions (no real-world execution needed)
        ↓
⑥ Best action executed → loop repeats
```

> *"The cost function is known and all modules are fully differentiable, so no action needs to be taken in reality to predict the future cost."*

---

## Energy-Based Models (EBM)

**Core idea:** Assign a scalar energy F(x, y) to every configuration.

```
F(x, y) → LOW   compatible pair    (car driving slowly in snow)
F(x, y) → HIGH  incompatible pair  (car teleporting)
```

**Inference:**  `ŷ = argmin_y F_w(x, y)`

**No partition function needed** — avoids intractability.

**Latent variable EBMs** add hidden variable z:
```
E_w(x, y, z)  — z encodes pose, lighting, others' intentions
F_w(x, y) = argmin_z E_w(x, y, z)
```

---

## The Collapse Problem

**Joint-embedding architectures risk collapse:**

```
Encoder ignores all input
→  s_x = s_y = constant for every input
→  Energy always = 0
→  Model learns nothing
```

**Prevention strategies:**

| Method | Approach |
|--------|----------|
| Contrastive (SimCLR, MoCo) | Push up energy of negative samples |
| VICReg | Enforce variance + decorrelate covariance |
| Barlow Twins | Drive cross-correlation matrix → identity |
| BYOL / SimSiam | Momentum encoder + stop-gradient |
| **JEPA (I-JEPA)** | **EMA target + constrained latent z capacity** |

---

## JEPA: Joint Embedding Predictive Architecture

```
        x (context)          y (target)
            │                    │
         E_x(·)              E_y(·)  ← EMA of E_x
            │                    │
           s_x                  s_y
            │                    │
        Predictor g          (stop grad)
        (s_x, z) → ŝ_y
            │
       Loss: ‖ŝ_y − s_y‖²
```

**z** = latent variable encoding information in y not present in x

**Key:** predict in **representation space**, not pixel space.

---

## I-JEPA Concrete Example

**Task:** predict image patches from surrounding context

```
Context: large region (85-100% of image)
Target:  4 small blocks (15-20% each)

E_x(context)          → s_x
E_y(full image, EMA)  → s_y  (stable target)
g(s_x, position_tokens) → ŝ_y

Loss = ‖ŝ_y − s_y‖²
```

**What the encoder learns to ignore:**
- ❌ Texture
- ❌ Exact lighting
- ❌ Background noise

**What the encoder retains:**
- ✅ Object identity
- ✅ Pose and spatial relationships
- ✅ Semantic content

---

## H-JEPA: Hierarchical JEPA

Multiple JEPA levels at increasing **abstraction** and **temporal scale**:

```
JEPA-N (top)    Long-horizon predictions  — highest abstraction
      ↑ pool/coarsen
JEPA-2 (mid)    Medium-term predictions   — intermediate
      ↑ pool/coarsen
JEPA-1 (bottom) Short-term predictions   — low-level representations
```

**Enables hierarchical planning:**

```
Task: "Cook dinner"
  Level 3: dinner → shopping → prep → cook
  Level 2: prep → chop onions → boil water
  Level 1: chop → position knife → apply force
```

Each level updated by new observations — **robust to unexpected events.**

---

## JEPA vs. Generative Models

| Property | Generative (MAE, VAE) | JEPA |
|----------|-----------------------|------|
| Prediction space | **Pixel space** | **Representation space** |
| Blurry outputs? | Yes — averages modes | No — abstracts away details |
| Mode-dropping? | Yes — generative models drop modes | No — z encodes missing info |
| Augmentation needed? | No | No |
| Scalability | Good | **Excellent** |

**Benchmark (ViT-H/14 linear probe):**
```
MAE:    77.2% ImageNet top-1
I-JEPA: 79.3%  ← better, with fewer epochs
```

---

## H-JEPA as the World Model

H-JEPA serves as the **central world model** in the six-module architecture:

```
Trained via SSL on observed sequences
        ↓
No labels, no rewards, no trial-and-error
        ↓
Predicts future representations given state + action
        ↓
Fully differentiable — cost gradients flow to actor
        ↓
Multi-timescale — plan at different horizons
```

> **The world model enables planning without real-world execution.**

---

## EMA Target Encoder

**Why EMA?** Provides slowly-evolving, stable prediction targets.

```
θ̄ ← τ · θ̄ + (1−τ) · θ

τ: 0.996 → 1.0 (annealed over training)
```

**Benefits:**
- Target is always **slightly ahead** of the encoder
- Non-trivial, stable learning signal
- **No negative samples needed**
- Prevents collapse without contrastive pairs

---

## Why Representation Space Wins

**Latent variable z constraint:**

```
Too much z capacity:
  z simply memorises target y
  → context encoder learns nothing

Right z capacity:
  z encodes only unpredictable variance (which mode)
  encoder learns all predictable semantic content
```

**SSL bits per sample:**

```
Supervised (ImageNet label):   ~10 bits
Self-supervised (masking):     ~10⁵ bits
```

> SSL is **~10,000× more informationally efficient** per training sample.

---

## RL vs. Gradient-Based Planning

| | Reinforcement Learning | Model-Based (JEPA) |
|---|---|---|
| **Action selection** | Execute action in world | Simulate in world model |
| **Learning signal** | Observe real outcome | Predict outcome |
| **Steps needed** | Millions | Gradient descent |
| **Safety** | Must risk real failure | Plan in simulation |
| **Key equation** | reward ← r(s, a) | ŷ ← WorldModel(s, a) |

```
RL path:     act → observe → update (millions of trials)
JEPA path:   simulate → gradient descent → act once
```

---

## Architecture Comparison

| Approach | Prediction Space | Collapse Prevention | Planning |
|----------|-----------------|---------------------|---------|
| Supervised | Label space | N/A | None |
| Reinforcement | Reward signal | N/A | Trial & error |
| Contrastive SSL (SimCLR) | Embedding space | Negative pairs | None |
| Generative (MAE) | **Pixel space** | Decoder | None |
| **I-JEPA** | **Repr. space** | **EMA + regularisation** | None |
| **H-JEPA + 6-module** | **Hierarchical repr.** | **EMA + regularisation** | **Gradient-based, multi-scale** |

---

## Three Core Challenges

LeCun identifies three fundamental open problems:

### 1. Representations
> How can machines learn world representations via SSL without supervision?

### 2. Reasoning
> How can reasoning be made compatible with deep learning (gradient-based)?

### 3. Planning
> How can machines plan complex hierarchical action sequences across multiple timescales?

**H-JEPA + the six-module architecture is proposed as the unified answer to all three.**

---

## Key Insights Summary

| Insight | Details |
|---------|---------|
| 🧠 Predict in repr. space | Encoders filter unpredictable details; no blurry outputs |
| ⚡ EMA for stable targets | Slowly-evolving target; no negatives needed |
| 🔒 Constrain z capacity | Prevents z from memorising targets |
| 📊 Regularised > contrastive | VICReg / Barlow Twins scale better with dimension |
| 🌳 Hierarchy for planning | H-JEPA enables multi-timescale planning |
| 🎯 Intrinsic motivation | Built-in cost drives behaviour without external rewards |
| 🔄 Replace RL with gradients | Gradient descent through differentiable world model |

---

## Closing Quote

> *"The main premise is that intelligent behavior emerges from the interplay between a world model, a cost module driving behavior through intrinsic motivation, and a hierarchical joint-embedding predictive architecture trained with self-supervised learning."*
>
> — **Yann LeCun, 2022**

---

## References & Resources

- 📄 **Paper:** "A Path Towards Autonomous Machine Intelligence"  
  Yann LeCun · OpenReview 2022  
  http://openreview.net/pdf?id=BZ5a1r-kVsf

- 🎥 **Video:** Yann LeCun — JEPA & Autonomous Intelligence  
  https://www.youtube.com/watch?v=VRzvpV9DZ8Y

- 🎥 **Video:** Yann LeCun — Path to Autonomous Machine Intelligence  
  https://www.youtube.com/watch?v=d_bdU3LsLzE

- 🌐 **Interactive Guide:**  
  https://mchinnappan100.github.io/pages2/AGI/jepa/jepa-framework.html

---

*End of slides — covering all 6 modules of the JEPA framework*
