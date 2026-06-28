Yes. As of 2026, several **JEPA (Joint-Embedding Predictive Architecture)** models are publicly available, primarily from Meta AI. They are mostly focused on **vision, video, and robotics**, rather than text generation.

Here's the current landscape:

| Model      | Domain               | Availability | Primary Use                                   |
| ---------- | -------------------- | ------------ | --------------------------------------------- |
| I-JEPA     | Images               | Open source  | Self-supervised image representation learning |
| V-JEPA     | Video                | Open source  | Video understanding                           |
| V-JEPA 2   | Video + World Models | Open source  | Video reasoning, robotics                     |
| V-JEPA 2.1 | Improved V-JEPA      | Open source  | Dense visual features, robotics               |
| JEPA-WM    | World Models         | Open source  | Physical planning and robotics                |

### 1. I-JEPA (Image JEPA)

Introduced by Yann LeCun in 2023.

Instead of reconstructing pixels (like MAE), it predicts **latent semantic representations**.

Advantages:

* Learns semantic features
* No pixel reconstruction
* Excellent visual representations
* Efficient training

Applications:

* Image classification
* Detection
* Segmentation
* Medical imaging

Meta released pretrained checkpoints and code. ([Meta AI][1])

---

### 2. V-JEPA

This extends JEPA to videos.

Rather than predicting future pixels, it predicts future **embeddings**.

This makes it much better at understanding:

* object motion
* actions
* interactions
* temporal reasoning

Applications include:

* video search
* action recognition
* robotics
* autonomous systems

([GitHub][2])

---

### 3. V-JEPA 2

Released in 2025.

Major improvements:

* trained on over a million hours of video
* much larger models
* stronger world modeling
* robotic planning
* video question answering

It can produce high-quality visual embeddings that downstream systems (often language models) can use for reasoning. ([Reddit][3])

---

### 4. V-JEPA 2.1

The newest iteration improves:

* dense visual features
* spatial localization
* robotic manipulation
* temporal consistency

It is currently one of Meta's strongest self-supervised vision models. ([arXiv][4])

---

### 5. JEPA World Models (JEPA-WM)

This is particularly exciting.

Instead of learning "what an image looks like," it learns:

* dynamics
* physics
* planning
* future latent states

It supports planning in latent space rather than pixel space.

Current environments include:

* RoboCasa
* DROID
* MetaWorld
* Push-T
* PointMaze

Meta has released pretrained checkpoints and code. ([GitHub][5])

---

## Are they usable today?

Yes.

You can:

* download pretrained weights
* fine-tune them
* use them as feature extractors
* build robotic planners
* integrate them with language models

Most implementations are in PyTorch.

---

## What JEPA is *not*

JEPA is **not** a replacement for an LLM like OpenAI's GPT models.

Instead:

* GPT predicts the **next token**
* JEPA predicts the **next latent representation**

Think of JEPA as learning an internal model of the world rather than generating text. It is often best viewed as a component that can be paired with generative models. ([Reddit][6])

---

## Why many researchers are excited

JEPA addresses several limitations of autoregressive models:

* No need to predict every pixel or token
* Focuses on abstract semantics
* Better sample efficiency
* Better suited for planning
* More robust representations
* Natural fit for robotics and embodied AI

This aligns with Yann LeCun's long-term vision of AI systems that learn predictive world models rather than relying solely on next-token prediction.

Given your interest in AI agents and enterprise automation, a compelling direction is to combine:

* **JEPA** for learning structured state representations and predicting workflow evolution,
* **LLMs** for reasoning, planning, and natural-language interaction,
* **Agent frameworks** for executing actions across systems like Salesforce.

That combination is well suited to building intelligent enterprise automation that can both understand complex system state and carry out multi-step workflows.

[1]: https://ai.meta.com/blog/yann-lecun-ai-model-i-jepa/?utm_source=chatgpt.com "The first AI model based on Yann LeCun’s vision for more human-like AI"
[2]: https://github.com/facebookresearch/jepa?utm_source=chatgpt.com "GitHub - facebookresearch/jepa: PyTorch code and models for V-JEPA self-supervised learning from video. · GitHub"
[3]: https://www.reddit.com/r/machinelearningnews/comments/1l9h9px?utm_source=chatgpt.com "Meta AI Releases V-JEPA 2: Open-Source Self-Supervised World Models for Understanding, Prediction, and Planning"
[4]: https://arxiv.org/abs/2603.14482?utm_source=chatgpt.com "V-JEPA 2.1: Unlocking Dense Features in Video Self-Supervised Learning"
[5]: https://github.com/facebookresearch/jepa-wms?utm_source=chatgpt.com "GitHub - facebookresearch/jepa-wms: Code, data and weights for the paper **What drives success in physical planning with Joint-Embedding Predictive World Models?** · GitHub"
[6]: https://www.reddit.com/r/artificial/comments/1tjuats/so_what_is_yann_lecuns_world_models_and_jepa_and/?utm_source=chatgpt.com "So, what is Yann LeCun's \"World Models\" and JEPA and is it Really a Replacement for LLMs?"
