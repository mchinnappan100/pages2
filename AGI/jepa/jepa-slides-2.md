````markdown
---
theme: default
paginate: true
marp: true
title: "JEPA: A Path Toward AGI"
description: Joint Embedding Predictive Architecture and the Future of AI
---

# JEPA
## Joint Embedding Predictive Architecture

### A Path Toward More General Intelligence

**Topics**
- Why next-token prediction is not enough
- What JEPA changes
- World models
- Planning and reasoning
- Towards AGI

---

# The Problem with Today's LLMs

Large Language Models are excellent at:

- Text generation
- Coding
- Translation
- Summarization
- Question answering

But they still struggle with:

- Understanding the physical world
- Long-term planning
- Learning from observation
- Abstract reasoning
- Acting autonomously

---

# Current LLM Pipeline

```text
Text
 │
 ▼
Tokenizer
 │
 ▼
Transformer
 │
 ▼
Predict Next Token
 │
 ▼
Generated Text
```

Learning Objective

```
Input Tokens
      │
      ▼
Predict Next Token
      │
      ▼
Cross Entropy Loss
```

Everything revolves around predicting the next token.

---

# The Limitation

Suppose we have:

```
The cat jumped onto the _____
```

LLMs learn to predict

```
table
chair
roof
bed
```

They are rewarded for predicting words—not understanding reality.

This encourages memorization of statistical patterns.

---

# Human Learning is Different

Children rarely learn by predicting words.

Instead they learn by

- Observing
- Experimenting
- Predicting consequences
- Building mental models
- Correcting expectations

Humans build internal world models.

---

# Jean Piaget's Influence

JEPA is inspired by developmental psychology.

Piaget proposed that intelligence develops by building internal models of reality.

Learning occurs by predicting what should happen next—not necessarily the exact observation.

---

# What is JEPA?

JEPA stands for

**Joint Embedding Predictive Architecture**

Instead of predicting pixels or words...

it predicts a **representation** of the future.

```
Past
 │
 ▼
Encoder
 │
 ▼
Embedding
 │
 ├──────────────┐
 │              │
 ▼              ▼
Predictor    Target Encoder
 │              │
 ▼              ▼
Predicted   Future Embedding
Embedding
```

The prediction happens in latent space.

---

# Core Components

```
Context
   │
   ▼
Context Encoder
   │
   ▼
Latent Representation
   │
   ▼
Predictor
   │
   ▼
Predicted Future Representation

-------------------------------

Future Observation
        │
        ▼
Target Encoder
        │
        ▼
Actual Future Representation
```

Training minimizes the distance between the two embeddings.

---

# High-Level Architecture

```text
          Context

             │
             ▼

     Context Encoder
             │
             ▼
      Context Embedding
             │
             ▼
         Predictor
             │
             ▼
 Predicted Future Embedding

                 ▲
                 │

        Future Observation
                 │
                 ▼
        Target Encoder
                 │
                 ▼
      Future Embedding
```

Loss compares the two embeddings.

---

# Why Predict Embeddings?

Predicting pixels is extremely difficult.

Small pixel changes can mean nothing.

Example

```
Frame A

Cat moves 2 pixels

Frame B
```

Pixel loss becomes large.

Meaning changes very little.

Embedding space captures semantics rather than appearance.

---

# Example

Imagine driving.

Current image

```
🚗
Road
Cars
Traffic Light
```

JEPA predicts

```
Future traffic situation
```

not

```
Every pixel of the next camera frame
```

This is much easier and more meaningful.

---

# Learning Abstract Concepts

Instead of learning

```
Pixel → Pixel
```

JEPA learns

```
Situation

↓

Meaning

↓

Future Meaning
```

This encourages abstraction.

---

# Building World Models

JEPA naturally learns

- Object permanence
- Physics
- Motion
- Cause and effect
- Spatial relationships
- Temporal dynamics

These become internal world models.

---

# World Model

```
Observation

     │

     ▼

Internal Representation

     │

     ▼

Predict Future State

     │

     ▼

Compare with Reality

     │

     ▼

Update World Model
```

---

# Why This Matters

A world model enables

- Planning
- Simulation
- Imagination
- Counterfactual reasoning

Instead of reacting...

the model can think ahead.

---

# From Pattern Matching to Understanding

Traditional LLM

```
Question

↓

Pattern Matching

↓

Answer
```

JEPA

```
Observation

↓

World Model

↓

Reasoning

↓

Prediction

↓

Action
```

---

# Planning

Agent Goal

```
Reach Destination
```

Instead of random actions

```
Action

↓

Observe

↓

Repeat
```

JEPA allows

```
Current State

↓

Simulate Future

↓

Evaluate

↓

Choose Best Plan
```

---

# Imagination

Humans ask

"What happens if..."

JEPA enables

```
Current State

↓

Simulate Possible Futures

↓

Choose Best Outcome
```

This is a major ingredient for intelligent agents.

---

# Active Learning

Instead of consuming internet text forever...

JEPA can learn from

- Cameras
- Robots
- Audio
- Sensors
- Interaction

This resembles how humans learn.

---

# Multi-modal Learning

JEPA naturally combines

```
Vision

Audio

Language

Touch

Motion

Actions
```

into one shared representation.

---

# JEPA + Language Models

Future systems may combine

```
Language Model

+

JEPA World Model

+

Memory

+

Planner

+

Tool Use

+

Robotics
```

This becomes much closer to general intelligence.

---

# Toward AGI

Possible evolution

```
LLMs
   │
   ▼
Reasoning
   │
   ▼
World Models
   │
   ▼
Planning
   │
   ▼
Embodied Agents
   │
   ▼
Autonomous Learning
   │
   ▼
AGI
```

---

# Ingredients of AGI

A complete AGI likely requires

- Representation learning
- Memory
- Planning
- Long-term goals
- Tool use
- World models
- Curiosity
- Continuous learning
- Reasoning
- Self-improvement

JEPA contributes primarily to the **world model** component.

---

# JEPA in the AGI Stack

```text
                AGI

                 ▲

      Planning & Reasoning

                 ▲

          World Model
             (JEPA)

                 ▲

 Representation Learning

                 ▲

 Perception (Vision, Audio, Language)
```

---

# Strengths of JEPA

✅ Self-supervised learning

✅ Sample efficient

✅ Learns abstract representations

✅ Supports planning

✅ Multi-modal

✅ Better suited for robotics

✅ More biologically inspired

---

# Current Challenges

Open research questions

- How large should the latent space be?
- How should memory be integrated?
- How to combine with symbolic reasoning?
- How to perform long-horizon planning?
- How to learn continually?
- How to align with human values?

---

# Is JEPA Alone Enough for AGI?

Probably not.

AGI likely requires

```
JEPA

+

LLMs

+

Memory

+

Reasoning

+

Planning

+

Tool Use

+

Embodiment

+

Continual Learning
```

JEPA provides one of the most important missing pieces:
a scalable **world model**.

---

# Key Takeaways

- LLMs predict tokens.
- JEPA predicts representations.
- Representations capture meaning.
- Meaning enables world models.
- World models enable planning.
- Planning enables intelligent behavior.
- This moves AI closer to AGI.

---

# Vision

```
Statistical AI

↓

Representation Learning

↓

World Models

↓

Reasoning

↓

Planning

↓

Autonomous Agents

↓

Artificial General Intelligence
```

> "The future of AI may not be about predicting the next word,
> but about understanding the next state of the world."
````
