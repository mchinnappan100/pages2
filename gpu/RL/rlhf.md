OpenAI uses **Reinforcement Learning from Human Feedback (RLHF)** and more recently **Reinforcement Learning from AI Feedback (RLAIF)** and reinforcement learning techniques that leverage verifiable outcomes, rather than "pure" reinforcement learning as used in game-playing systems.

Here's how reinforcement learning fits into modern OpenAI models.

## 1. Pretraining (Not RL)

The majority of the model's knowledge comes from **self-supervised learning**, not reinforcement learning.

```
Internet + Books + Code
          │
          ▼
 Predict the Next Token
          │
          ▼
 Pretrained LLM
```

The model simply learns to predict the next word (token).

This stage accounts for **most of the model's capabilities**.

---

## 2. Supervised Fine-Tuning (SFT)

Humans write high-quality example conversations.

```
Prompt
   │
   ▼
Human-written ideal response
   │
   ▼
Model learns to imitate
```

No reinforcement learning yet.

---

## 3. Reinforcement Learning

Now reinforcement learning is used to improve **how the model behaves**, rather than to teach it basic knowledge.

### RLHF (Reinforcement Learning from Human Feedback)

Humans compare multiple answers.

Example:

```
Question:
How do I bake bread?

Answer A ⭐⭐⭐⭐⭐
Answer B ⭐⭐
Answer C ⭐⭐⭐
```

A **reward model** learns human preferences.

Then reinforcement learning optimizes the language model to maximize that reward.

Pipeline:

```
          Humans rank answers
                  │
                  ▼
           Reward Model
                  │
                  ▼
         Reinforcement Learning
                  │
                  ▼
        Better ChatGPT responses
```

---

### RLAIF (Reinforcement Learning from AI Feedback)

Instead of humans scoring every answer:

```
Model A
   │
judges
   ▼
Model B
```

Powerful AI models provide feedback that approximates human judgments, allowing much larger-scale training while humans continue to guide and audit the process.

---

### RL with Verifiable Rewards

For tasks with objectively correct answers, the reward doesn't have to come from people.

Example:

```
Problem:
What is 125 × 17?

Answer = 2125

Reward = 1
```

or

```
Write Python code

Run unit tests

Pass?
Reward = 1

Fail?
Reward = 0
```

This works well for:

* Mathematics
* Programming
* Logic problems
* Tool use
* Some reasoning tasks

---

## Which RL algorithm?

Historically, OpenAI popularized using algorithms such as **Proximal Policy Optimization (PPO)** for RLHF.

Over time, researchers have developed newer optimization methods that can be more stable or efficient for language models, so PPO is no longer the only approach used. OpenAI has not publicly disclosed every optimization algorithm used for current production models.

---

## Why use RL at all?

Reinforcement learning helps the model learn behaviors that next-token prediction alone doesn't directly optimize, such as:

* Following instructions more faithfully
* Being more helpful
* Producing safer responses
* Improving multi-step reasoning
* Using tools effectively
* Writing higher-quality code
* Staying on task over long interactions

---

## How much of the model comes from RL?

A useful mental model is:

| Training stage              | Contribution                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------- |
| Self-supervised pretraining | Learns language, facts, coding, world knowledge (the largest source of capability) |
| Supervised fine-tuning      | Learns the desired conversational style and instruction following                  |
| Reinforcement learning      | Refines behavior by optimizing for preferred or verifiably correct outcomes        |

So while reinforcement learning is a crucial part of modern OpenAI models, **it is not where the model learns most of its knowledge**. Most knowledge comes from large-scale pretraining; RL primarily shapes how that knowledge is applied during interactions.
