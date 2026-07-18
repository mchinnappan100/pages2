
## Proposed Layout

```
┌──────────────────────────────────────────────────────────────┐
│ Header                                                      │
│ Understanding Query (Q), Key (K) & Value (V)                │
│ 🌞/🌙 Theme Toggle                                           │
└──────────────────────────────────────────────────────────────┘

┌──────────────┬───────────────────────────────────────────────┐
│ Table of     │ Hero                                          │
│ Contents     │ Attention(Q,K,V)=softmax(QKᵀ/√dk)V            │
│ (Sticky)     │                                               │
│              │                                               │
│ • Intro      │                                               │
│ • Q          │                                               │
│ • K          │                                               │
│ • V          │                                               │
│ • Example    │                                               │
│ • Self Attn  │                                               │
│ • MultiHead  │                                               │
│ • Summary    │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

---

# Sections

## 1. Hero

Large banner

* Beautiful equation
* Your uploaded image
* Short introduction

---

## 2. Why Attention?

Animated sentence

```
The animal didn't cross the street
because it was tired.
```

Hover over **it**

See attention links.

---

## 3. The Attention Equation

Large formula

```
Attention(Q,K,V)
=
softmax(QKᵀ / √dk)V
```

Every symbol clickable.

Click **Q**

↓

Shows

```
Query

"What am I looking for?"
```

Click **K**

↓

Shows

```
Key

"What information do I have?"
```

Click **V**

↓

Shows

```
Value

"What information should I send?"
```

---

## 4. Q K V Explained

Three beautiful cards.

```
┌──────────┐
│ Query    │
└──────────┘

Search request
```

```
┌──────────┐
│ Key      │
└──────────┘

Lookup label
```

```
┌──────────┐
│ Value    │
└──────────┘

Actual information
```

---

## 5. Where do Q,K,V come from?

SVG diagram

```
Embedding

        x

        │

 ┌──────┼──────┐

 │      │      │

WQ     WK     WV

 │      │      │

 Q      K      V
```

Animated.

---

## 6. Mathematical Derivation

```
Q = XWQ

K = XWK

V = XWV
```

Explain every symbol.

---

## 7. Numerical Example

Everything computed step-by-step.

```
Embedding

↓

Q

↓

K

↓

QKᵀ

↓

Softmax

↓

Multiply V

↓

Context
```

---

## 8. Interactive Calculator

Editable matrices.

```
Q

1 0

K

1 1

0 1

V

10 20

50 60
```

Press

```
Calculate
```

Outputs

* Dot product
* Scaling
* Softmax
* Final vector

---

## 9. Why √dk ?

Animated slider.

Move

```
dk

2

8

64

512
```

Watch softmax change.

---

## 10. Self Attention

Animated sentence.

Hover over

```
cat
```

See attention lines.

---

## 11. Multi Head Attention

Interactive SVG.

```
Embedding

↓

Head 1

↓

Head 2

↓

Head 3

↓

Head 4

↓

Concat

↓

Output
```

---

## 12. Why Three Matrices?

Comparison table.

| Single Matrix       | QKV             |
| ------------------- | --------------- |
| Less expressive     | More expressive |
| Same representation | Separate roles  |
| Weaker attention    | Better learning |

---

## 13. Real LLM Dimensions

Table

| Model       | Embedding | Heads | Head Size |
| ----------- | --------- | ----- | --------- |
| GPT-2 Small | 768       | 12    | 64        |
| GPT-3 175B  | 12288     | 96    | 128       |
| Llama 3 8B  | 4096      | 32    | 128       |
| Llama 3 70B | 8192      | 64    | 128       |

---

## 14. Common Misconceptions

Accordion

> Is Query a question?

No.

It is a learned vector.

---

## 15. Interview Questions

Collapsible answers.

---

## 16. Summary

Beautiful infographic.

```
Embedding

↓

Linear Layers

↓

Q K V

↓

QKᵀ

↓

Scale

↓

Softmax

↓

Multiply V

↓

Context Vector
```

---

## 17. References

* Transformer paper
* Illustrated Transformer
* Attention visualization
* Further reading

---

# Features

* ✅ Tailwind CSS (CDN)
* ✅ Dark/Light mode
* ✅ Sticky table of contents
* ✅ Responsive design
* ✅ Smooth scrolling
* ✅ SVG diagrams (crisp at any resolution)
* ✅ MathJax for equations
* ✅ Interactive calculators (vanilla JavaScript)
* ✅ Collapsible explanations
* ✅ Syntax-highlighted code examples
* ✅ Scroll progress indicator
* ✅ "Back to Top" button
* ✅ Print-friendly styling

 
 
