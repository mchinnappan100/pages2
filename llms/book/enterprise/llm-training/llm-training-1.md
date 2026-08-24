# LLM Training Fundamentals — Study Notes

## 1. Big Picture

Training an LLM is essentially an optimization process:

**Model → Prediction → Loss → Backpropagation → Gradients → Optimizer → Updated Weights**

The goal is to continuously adjust the model's parameters so that the loss becomes smaller.

---

## 2. Partial Derivatives

An LLM has an enormous number of parameters (weights).

A **partial derivative** tells us:

> "If I change this particular parameter slightly, how does the loss change?"

For a parameter (w):

[
\frac{\partial L}{\partial w}
]

where:

* (L) = loss
* (w) = model parameter
* (\frac{\partial L}{\partial w}) = sensitivity of the loss to that parameter

For millions or billions of parameters, we calculate these derivatives efficiently using backpropagation.

---

## 3. Backpropagation

**Backpropagation** calculates the gradients of the loss with respect to the model's parameters.

Conceptually:

```text
Input
  ↓
Forward Pass
  ↓
Prediction
  ↓
Loss
  ↓
Backward Pass
  ↓
Gradients
  ↓
Optimizer
  ↓
Updated Weights
```

Backpropagation uses the **chain rule** from calculus to propagate the error backward through the network.

---

## 4. Gradient Descent

Once we know the gradients, gradient descent updates the parameters.

Basic equation:

[
w_{new} = w_{old} - \eta \frac{\partial L}{\partial w}
]

where:

* (w) = parameter
* (L) = loss
* (\eta) = learning rate

The negative sign means that we move in the direction that reduces the loss.

### Intuition

Think of the loss function as a mountain landscape.

* Gradient → tells us which direction is uphill.
* Negative gradient → tells us which direction is downhill.
* Learning rate → tells us how large a step to take.

---

## 5. Learning Rate

The **learning rate** is one of the most important training hyperparameters.

### Too large

```text
Loss
 ↑
 |    \  /
 |     \/\
 |    /  \
 +----------------→ Training
```

The model can overshoot the minimum and become unstable.

### Too small

Training becomes extremely slow and may require many more iterations.

Therefore, we generally don't want the model to "learn too fast."

### Learning-rate schedules

Common approaches include:

* Learning-rate warmup
* Learning-rate decay
* Cosine decay
* Constant learning rate
* Adaptive learning rates

---

## 6. Vanishing Gradients

During backpropagation, gradients can become extremely small as they propagate through many layers.

Eventually:

[
gradient \approx 0
]

Then earlier layers receive almost no useful learning signal.

This is called the **vanishing-gradient problem**.

Modern Transformer architectures help mitigate this through mechanisms such as:

* Residual connections
* Appropriate normalization
* Carefully designed activations
* Modern initialization techniques

---

## 7. Exploding Gradients

The opposite problem can also occur.

Gradients can become extremely large:

[
|\nabla L| \rightarrow \text{very large}
]

This can make training unstable.

A common technique is **gradient clipping**.

For example:

```text
If gradient > threshold
        ↓
Scale it down
```

This prevents a single update from becoming excessively large.

---

## 8. Adam Optimizer

Instead of using simple gradient descent, modern neural networks commonly use more sophisticated optimizers.

**Adam** combines ideas related to:

* Momentum
* Adaptive learning rates

It maintains estimates of the first and second moments of the gradients.

Conceptually:

```text
Gradient
   ↓
Momentum information
   +
Gradient magnitude information
   ↓
Adaptive parameter update
```

This allows different parameters to effectively receive different update magnitudes.

---

## 9. AdamW

**AdamW** is a widely used variant of Adam.

The important distinction is that AdamW **decouples weight decay from the gradient update**.

Conceptually:

```text
Gradient
   ↓
Adam update ─────→ parameter update

Weight decay ─────→ separate regularization effect
```

This makes weight decay behave more cleanly as a regularization mechanism.

AdamW is therefore commonly used when training Transformer-based models.

---

## 10. Weight Decay

Weight decay discourages parameters from becoming unnecessarily large.

Conceptually:

[
w \leftarrow w - \eta(\text{gradient update}) - \eta\lambda w
]

where:

* (\lambda) = weight-decay coefficient

It can help reduce overfitting and improve generalization.

---

## 11. Batch Size

Another important training parameter is **batch size**.

A batch is the number of training examples processed together before calculating an update.

### Small batch

Advantages:

* Less GPU memory
* More gradient noise
* Potentially better exploration

Disadvantages:

* Noisier gradient estimates
* Less efficient hardware utilization

### Large batch

Advantages:

* More stable gradient estimates
* Better hardware utilization
* Can improve training throughput

Disadvantages:

* Requires more memory
* May require learning-rate tuning
* Extremely large batches can affect optimization/generalization behavior

---

## 12. Gradient Accumulation

When GPU memory isn't large enough for a desired batch size, we can use **gradient accumulation**.

Example:

```text
Batch 1 → calculate gradients
Batch 2 → accumulate gradients
Batch 3 → accumulate gradients
Batch 4 → accumulate gradients
             ↓
       Update weights
```

For example:

```text
Micro-batch = 8
Gradient accumulation steps = 8

Effective batch size ≈ 8 × 8 = 64
```

This allows us to simulate a larger batch without requiring all examples to fit into memory simultaneously.

---

# 13. Loss Function

The training process needs a measure of how wrong the model's prediction is.

For language models, **cross-entropy loss** is commonly used.

Simplified idea:

```text
Expected token: "cat"

Model probabilities:
cat   → 0.80
dog   → 0.10
car   → 0.05
...
```

The model receives a lower loss when it assigns high probability to the correct token.

The training objective is approximately:

[
\min_{\theta} L(\theta)
]

where (\theta) represents all model parameters.

---

# 14. Data Quality

A powerful model cannot compensate indefinitely for poor training data.

Important considerations include:

* Data quality
* Data diversity
* Deduplication
* Removing corrupted data
* Removing unwanted content
* Correct tokenization
* Data balancing
* Preventing train/test contamination

A useful principle:

> **Better data can be more valuable than simply adding more data.**

---

# 15. Regularization

Regularization helps prevent the model from simply memorizing the training data.

Examples include:

* Weight decay
* Dropout in appropriate architectures
* Data quality/curation
* Early stopping in some training settings
* Careful dataset construction

The goal is good **generalization**.

---

# 16. Mixed-Precision Training

Training huge models using FP32 everywhere is expensive.

Modern training often uses lower precision such as:

* FP16
* BF16
* FP8 in some systems

The idea is:

```text
Lower precision
      ↓
Less memory
      ↓
Higher throughput
      ↓
Faster training
```

while maintaining enough numerical precision for stable optimization.

**BF16** is particularly useful for large-model training because it provides a large dynamic range.

---

# 17. Distributed Training

Large LLMs may not fit on a single GPU.

Training can therefore be distributed across many GPUs.

Common approaches include:

* Data parallelism
* Tensor parallelism
* Pipeline parallelism
* Fully sharded approaches

Conceptually:

```text
             LLM Training
                  |
        +---------+---------+
        |         |         |
      GPU 1     GPU 2     GPU 3
        |         |         |
        +---------+---------+
                  |
          Synchronization
```

This is essential for training very large models.

---

# 18. Checkpointing

Training can take days or weeks.

Therefore, models are periodically saved as **checkpoints**.

A checkpoint can contain:

* Model weights
* Optimizer state
* Learning-rate scheduler state
* Training step
* Random-number-generator state
* Other training metadata

If training fails:

```text
Checkpoint
    ↓
Resume training
```

instead of starting from zero.

---

# 19. Evaluation

We should continuously evaluate the model rather than looking only at training loss.

Useful measurements include:

* Training loss
* Validation loss
* Perplexity
* Task-specific benchmarks
* Generalization performance
* Safety evaluations
* Regression tests

A model can have decreasing training loss while its validation performance stops improving.

That can indicate **overfitting**.

---

# 20. Typical LLM Training Pipeline

A simplified modern LLM lifecycle looks like:

```text
Large-scale dataset
       ↓
Data cleaning
       ↓
Tokenization
       ↓
Pretraining
       ↓
Base model
       ↓
Instruction tuning
       ↓
Alignment / preference optimization
       ↓
Evaluation
       ↓
Deployment
       ↓
Monitoring
```

---

# 21. The Main Training Knobs

The important things we discussed can be grouped together:

| Area               | Examples                           |
| ------------------ | ---------------------------------- |
| Optimization       | Gradient descent, AdamW            |
| Calculus           | Partial derivatives, chain rule    |
| Gradient stability | Vanishing/exploding gradients      |
| Learning           | Learning rate, schedules           |
| Batching           | Batch size, gradient accumulation  |
| Regularization     | Weight decay                       |
| Precision          | FP32, FP16, BF16, FP8              |
| Data               | Quality, diversity, deduplication  |
| Architecture       | Transformers, residual connections |
| Infrastructure     | GPUs, distributed training         |
| Reliability        | Checkpoints                        |
| Evaluation         | Validation loss, benchmarks        |

---

# 22. The Key Mental Model

The whole process can be remembered as:

```text
              TRAINING LOOP

              Training Data
                    ↓
              Forward Pass
                    ↓
                Prediction
                    ↓
                  Loss
                    ↓
             Backpropagation
                    ↓
                Gradients
                    ↓
                AdamW
                    ↓
             Learning Rate
                    ↓
             Weight Updates
                    ↓
             Next Training Step
                    ↺
```

The optimizer and training configuration determine **how aggressively and safely the model changes its parameters**.

---

# 23. What We Can Study Next

The next natural step is to go into the **mathematics of Transformers and self-attention**.

A good progression would be:

1. Vector and matrix notation
2. Embeddings
3. Query, Key, and Value
4. Dot-product attention
5. Softmax
6. Scaled dot-product attention
7. Multi-head attention
8. Positional encoding / positional representations
9. Feed-forward network
10. Residual connections
11. Layer normalization
12. Complete Transformer block
13. Backpropagation through attention
14. Computational complexity
15. KV cache during inference

The particularly interesting part will be connecting the two topics:

**attention mathematics → partial derivatives → backpropagation → AdamW → actual parameter updates.**

That will give us a much deeper understanding of *how an LLM actually learns*.
