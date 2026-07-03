The **Multi-Head Attention** block is the core innovation of the Transformer architecture. It allows the model to determine **which other tokens are relevant when processing each token**.

Let's build it step by step.

---

# Overall Flow

```text
Input Embeddings
       │
       ▼
  Linear Layer
       │
       ├─────────────┐
       │             │
       ▼             ▼
       Q             K             V
(Query)          (Key)         (Value)
       │             │             │
       └──────┬──────┘             │
              ▼
          Q × Kᵀ
              │
              ▼
      Scale by √dk
              │
              ▼
          Softmax
              │
              ▼
 Attention Weights
              │
              ▼
   Weights × V
              │
              ▼
        Head Output

Repeat this for many heads

Head1
Head2
Head3
...
HeadN

        │
        ▼
 Concatenate Heads
        │
        ▼
  Final Linear Layer
        │
        ▼
 Transformer Output
```

---

# What are Q, K and V?

Suppose the sentence is

```text
The cat sat on the mat.
```

Each word is first converted into an embedding.

Example (greatly simplified)

| Word | Embedding         |
| ---- | ----------------- |
| The  | [0.2,0.5,0.1,...] |
| cat  | [0.8,0.4,0.7,...] |
| sat  | [0.1,0.6,0.9,...] |
| on   | ...               |
| mat  | ...               |

These embeddings are **not** directly used for attention.

Instead three learned matrices produce

```text
Q = XWQ
K = XWK
V = XWV
```

where

```text
X = embedding matrix
WQ = learned weights
WK = learned weights
WV = learned weights
```

These are different projections of the same embedding.

---

# Intuition

Imagine a library.

Every book has

```text
Title
Contents
```

Suppose you ask

```text
Books about AI
```

Your question is the **Query**.

The catalog contains keywords for every book.

Those are the **Keys**.

The actual book contents are the **Values**.

```text
Query
   │
   ▼
Compare with Keys
   │
Best matching books
   │
Read their Values
```

Exactly the same thing happens in Transformers.

---

# Meaning of Q

Think of Query as

> "What information am I looking for?"

For the word

```text
sat
```

the Query might ask

```text
Who performed the action?
```

---

# Meaning of K

Every word advertises

```text
What information do I contain?
```

Example

```text
cat
```

may advertise

```text
I am an animal
I am likely the subject
```

These advertisements are Keys.

---

# Meaning of V

The Value is the actual information that will be copied.

Example

```text
cat
```

Value contains

```text
representation of "cat"
```

---

# Visual Example

Sentence

```text
The cat sat on the mat
```

Processing word

```text
sat
```

The Query from "sat"

```text
Who sat?
```

Compare against Keys

```text
The     score = 0.1

cat     score = 0.95

sat     score = 0.4

on      score = 0.05

the     score = 0.1

mat     score = 0.2
```

Softmax converts them into probabilities

```text
The   2%

cat  70%

sat  15%

on    2%

the   2%

mat   9%
```

Now multiply these weights with Values.

```text
Output =
0.02×V(The)
+
0.70×V(cat)
+
0.15×V(sat)
+
...
```

The resulting vector mainly represents

```text
cat
```

Thus

```text
sat
```

knows

```text
cat sat
```

---

# Why don't we just use embeddings?

Because embeddings serve multiple purposes.

The model learns specialized projections.

```
Embedding
      │
      ├────► Query
      │
      ├────► Key
      │
      └────► Value
```

Each projection emphasizes different aspects.

For example

```
Embedding

contains

meaning
grammar
position
tense
semantic information
```

The Query projection might emphasize

```
What do I need?
```

The Key projection

```
What can I provide?
```

The Value projection

```
What information should be copied?
```

---

# Mathematical Example

Suppose

```
Q = [2 1]

K1 = [2 2]

K2 = [0 1]

K3 = [3 1]
```

Compute similarity using dot product.

```
Q·K1 = 6

Q·K2 = 1

Q·K3 = 7
```

So

```
K3
```

matches best.

After softmax

```
0.42

0.01

0.57
```

These become the attention weights.

---

# Values Example

Suppose

```
V1 = [10,5]

V2 = [2,8]

V3 = [7,9]
```

Output

```
0.42×V1
+
0.01×V2
+
0.57×V3
```

Approximately

```
=
0.42(10,5)
+
0.01(2,8)
+
0.57(7,9)

=
(8.2,7.3)
```

That vector is the output of one attention head.

---

# Why Multiple Heads?

One attention mechanism can usually focus on **one type of relationship** at a time.

Different heads specialize in different patterns.

Example sentence

```text
The animal didn't cross the street because it was tired.
```

Different heads might learn:

| Head   | Focus                               |
| ------ | ----------------------------------- |
| Head 1 | Subject–verb agreement              |
| Head 2 | Pronoun resolution ("it" → animal)  |
| Head 3 | Position information                |
| Head 4 | Negation ("didn't")                 |
| Head 5 | Long-distance dependencies          |
| Head 6 | Semantic similarity                 |
| Head 7 | Syntax (noun phrases)               |
| Head 8 | Punctuation and sentence boundaries |

---

# Multi-Head Architecture

```text
                Input
                  │
      ┌───────────┼───────────┐
      ▼           ▼           ▼
   Head1       Head2       Head3
      │           │           │
      ▼           ▼           ▼
 Attention    Attention   Attention
      │           │           │
      ▼           ▼           ▼
   Output1     Output2     Output3
      └───────────┼───────────┘
                  ▼
            Concatenate
                  ▼
            Linear Layer
                  ▼
             Final Output
```

Each head has **its own** learned matrices:

```
Head 1
WQ¹ WK¹ WV¹

Head 2
WQ² WK² WV²

...

Head 8
WQ⁸ WK⁸ WV⁸
```

Thus every head learns a different notion of "importance."

---

# Why is it called "Attention"?

Instead of processing every token equally, the model assigns **attention weights** to other tokens, allowing it to concentrate more on the most relevant words.

For example, when generating the word **"sat"** in "The cat sat on the mat," the model gives much higher attention to **"cat"** than to **"the"** or **"on."** This selective focus lets the Transformer capture grammar, semantics, and long-range dependencies efficiently, making attention the fundamental mechanism that powers modern large language models.
