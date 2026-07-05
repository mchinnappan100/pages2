**Splitting** and **sharding** are related concepts, but they solve different problems. The distinction is important when discussing databases and LLMs.

| Feature | Splitting                             | Sharding                                       |
| ------- | ------------------------------------- | ---------------------------------------------- |
| Purpose | Divide something into parts           | Distribute parts across multiple machines      |
| Storage | May still be on one machine           | Spread across multiple machines                |
| Goal    | Organization, batching, preprocessing | Scalability and parallelism                    |
| Example | Split a file into 100 chunks          | Store chunk 1 on server A, chunk 2 on server B |

---

## 1. Splitting

Splitting simply means breaking a large object into smaller pieces.

For example, suppose you have a 10 GB text file.

```
10 GB File
    |
    +---- Part 1 (1 GB)
    +---- Part 2 (1 GB)
    +---- Part 3 (1 GB)
    ...
```

All parts might still live on the same computer.

### Examples

* Splitting a dataset into train/validation/test
* Splitting a video into frames
* Splitting a document into chunks for RAG
* Splitting a tensor into smaller tensors

PyTorch example:

```python
import torch

x = torch.arange(12)

chunks = torch.chunk(x, 3)

for c in chunks:
    print(c)
```

Output

```
tensor([0,1,2,3])
tensor([4,5,6,7])
tensor([8,9,10,11])
```

Nothing is distributed.

---

## 2. Sharding

Sharding means dividing data (or model parameters) and **placing each piece on different machines or devices**.

Instead of

```
Machine A
---------
Entire Database
```

you have

```
Machine A        Machine B       Machine C

Users A-H        Users I-Q       Users R-Z
```

Each machine owns only part of the data.

---

### Database Example

Suppose a website has 300 million users.

Instead of one giant database:

```
DB
 ├── Alice
 ├── Bob
 ├── Carol
 ├── ...
```

Use three shards:

```
Shard 1
A-H

Shard 2
I-Q

Shard 3
R-Z
```

A query for "Bob" only touches Shard 1.

---

## 3. LLM Sharding

A 700B parameter model cannot fit on one GPU.

Suppose each GPU holds only 100B parameters.

```
GPU0
Layers 1-10

GPU1
Layers 11-20

GPU2
Layers 21-30

GPU3
Layers 31-40
```

This is **model sharding**.

Each GPU stores only part of the model.

---

## 4. Tensor Sharding

Instead of storing one huge matrix

```
10000 × 10000
```

split it across GPUs.

```
GPU0

AAAA

GPU1

BBBB

GPU2

CCCC
```

Each GPU stores only its shard.

---

## 5. Weight Sharding

Imagine a weight matrix

```
W

+-----------------------+
|                       |
|                       |
|                       |
+-----------------------+
```

Split by rows

```
GPU0

Rows 1-5000

GPU1

Rows 5001-10000
```

or by columns

```
GPU0

Cols 1-5000

GPU1

Cols 5001-10000
```

This is commonly used in tensor parallelism.

---

## 6. Data Sharding

Training data can also be sharded.

```
Dataset

1 million images

GPU0 -> Images 1-250k

GPU1 -> Images 250k-500k

GPU2 -> Images 500k-750k

GPU3 -> Images 750k-1M
```

Each worker reads only its own shard.

---

## 7. Difference Visually

### Splitting

```
Large File

        |
        V

+-----+
|Part1|
+-----+

+-----+
|Part2|
+-----+

+-----+
|Part3|
+-----+

(All on one computer)
```

### Sharding

```
          Dataset

             |
   +---------+----------+
   |         |          |
   V         V          V

Server A  Server B   Server C

Shard A   Shard B    Shard C
```

---

## 8. In LLM Training

Different parallelism techniques use sharding in different ways:

| Technique                               | What is sharded?                            |
| --------------------------------------- | ------------------------------------------- |
| Data Parallelism                        | Training data                               |
| Tensor Parallelism                      | Weight tensors                              |
| Pipeline Parallelism                    | Layers of the network                       |
| Expert Parallelism (Mixture of Experts) | Experts                                     |
| Optimizer Sharding (e.g., ZeRO)         | Optimizer states, gradients, and parameters |

---

## 9. Relationship Between Splitting and Sharding

You can think of sharding as **splitting with distribution**:

```
Splitting
---------
Large Object
      |
      +--> Piece 1
      +--> Piece 2
      +--> Piece 3

Sharding
---------
Large Object
      |
      +--> Piece 1 --> GPU0
      +--> Piece 2 --> GPU1
      +--> Piece 3 --> GPU2
```

**Key takeaway:** Every shard is a split, but not every split is a shard. Sharding specifically implies that the pieces are distributed across multiple storage devices, servers, or accelerators to improve scalability, memory capacity, throughput, or fault isolation.
