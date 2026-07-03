## Question:
The LLM model has about 37 billion active parameters, and 700 billion total parameters. what this means active and total?


This refers to a **Mixture of Experts (MoE)** architecture, which is used by many modern LLMs. The distinction between **active parameters** and **total parameters** is one of the biggest innovations that makes these models efficient.

## Dense Model vs. MoE Model

### Dense Model

In a traditional Transformer (such as GPT-3), **every parameter is used for every token**.

```
Input Token
     │
     ▼
+----------------------+
| All 175B parameters  |
| are executed         |
+----------------------+
     │
     ▼
Output
```

If the model has **175 billion parameters**, then every generated token uses all **175 billion**.

---

### Mixture of Experts (MoE)

In an MoE model, the network contains many expert subnetworks.

A **router** decides which experts are best suited for the current token.

```
                 Token
                   │
                   ▼
             +------------+
             |  Router    |
             +------------+
               │       │
       chooses only a few experts
               │
      ┌────────┴─────────┐
      ▼                  ▼
  Expert 3          Expert 17
      │                  │
      └────────┬─────────┘
               ▼
            Output
```

Although the model *contains* hundreds of billions of parameters, only a fraction participate in each forward pass.

---

# Example: 700B Total, 37B Active

Suppose the model contains

* 64 experts
* each expert has about 10B parameters
* shared layers have 20B parameters

Then

```
Shared layers        = 20B

Expert 1             = 10B
Expert 2             = 10B
...
Expert 64            = 10B

Total
= 20 + (64 × 10)
= 660B
≈700B
```

Now suppose the router activates only **2 experts**.

Then for one token:

```
20B shared
+10B Expert 5
+10B Expert 21

≈40B active
```

Only around **40B** parameters perform computation.

The remaining **620B** parameters are idle for that token.

---

## What does "37B active" mean?

It means that **for each token**, approximately **37 billion parameters actually perform computation**.

These include:

* embeddings
* attention layers
* shared feed-forward layers
* the selected expert networks

Everything else is skipped.

---

## What does "700B total" mean?

The model stores roughly **700 billion learned weights**.

```
Total Parameters
┌──────────────────────────────┐
│ Expert 1                     │
│ Expert 2                     │
│ Expert 3                     │
│ ...                          │
│ Expert 64                    │
│ Shared Transformer Layers    │
└──────────────────────────────┘

≈700B
```

They all occupy memory, but most are **not used for a given token**.

---

## Analogy

Imagine a hospital.

* The hospital employs **700 doctors** (total parameters).
* A patient is treated by **37 doctors** (active parameters).
* The other doctors remain available for other patients.

```
Hospital
├── 700 Doctors
│
├── Patient A
│      ├── Doctor 5
│      ├── Doctor 18
│      ├── Doctor 200
│      └── ...
│
└── Remaining doctors idle
```

The hospital still has 700 doctors, but only a small subset works on one patient.

---

## Why use MoE?

The benefits are:

| Dense Model                        | MoE Model                                           |
| ---------------------------------- | --------------------------------------------------- |
| All parameters compute every token | Only selected experts compute                       |
| Higher compute cost                | Much lower compute cost                             |
| Simpler architecture               | Router dynamically selects experts                  |
| Scaling increases compute linearly | Scaling increases capacity much faster than compute |

This lets researchers build models with **hundreds of billions or even trillions of total parameters** while keeping the computation per token closer to that of a much smaller dense model.

---

## Real-world intuition

When you hear:

> **"37B active, 700B total"**

you can interpret it as:

* **700B total** = the model's total knowledge capacity (all learned weights stored in memory).
* **37B active** = the subset of parameters actually used to process each input token, determining the compute cost and inference speed.

This is why an MoE model with **700B total parameters** can often run at a speed and cost comparable to a dense model with roughly **37B parameters**, while benefiting from the much larger overall capacity.
