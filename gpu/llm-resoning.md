Modern LLMs use a variety of **reasoning, planning, retrieval, and execution strategies**. Some of these are prompting techniques, while others are full agent architectures. Here's a taxonomy of the most important ones.

---

# 1. Chain-of-Thought (CoT)

The model generates intermediate reasoning before the final answer.

```
Question
    │
    ▼
Reasoning Step 1
    ▼
Reasoning Step 2
    ▼
Reasoning Step 3
    ▼
Final Answer
```

Example

```
Q: Roger has 5 apples...
Reasoning:
5 + 3 = 8
8 - 2 = 6

Answer: 6
```

**Pros**

* Better math
* Better logic
* Better planning

**Limitations**

* Reasoning may not be faithful
* Expensive (more tokens)

---

# 2. Zero-shot Chain-of-Thought

Instead of examples, simply prompt:

> "Let's think step by step."

Surprisingly effective.

Paper:
Large Language Models are Zero-Shot Reasoners

---

# 3. Few-shot CoT

Provide several solved examples.

```
Example 1
Reasoning...

Example 2
Reasoning...

Now solve:
```

Works better on complex reasoning.

---

# 4. Self-Consistency

Instead of one reasoning path:

```
Question
   │
 ┌─┴──────────────┐
 ▼               ▼
Reasoning A   Reasoning B
 ▼               ▼
Answer A      Answer B
        ...
```

Take the majority answer.

Greatly improves math benchmarks.

---

# 5. Tree of Thoughts (ToT)

Instead of a single reasoning chain:

```
            Start
           /   |   \
         Idea Idea Idea
         /      |
      Expand  Expand
        |
     Evaluate
        |
     Best branch
```

The model searches multiple reasoning paths.

Paper:
Tree of Thoughts: Deliberate Problem Solving with Large Language Models

Useful for:

* planning
* puzzles
* coding
* game playing

---

# 6. Graph of Thoughts

Generalizes Tree of Thoughts.

Reasoning is a graph.

```
Idea A ───── Idea B
  │            │
  ▼            ▼
Idea C ───── Idea D
      │
      ▼
 Final
```

Allows merging and revisiting ideas.

---

# 7. ReAct (Reason + Act)

Probably the most influential agent framework.

The model alternates between thinking and taking actions.

```
Question
    │
Thought
    │
Action
    │
Observation
    │
Thought
    │
Action
    │
Observation
    │
Answer
```

Example

```
Thought:
Need weather.

Action:
Search("Boston weather")

Observation:
75°F

Thought:
Need umbrella advice.

Answer:
No umbrella needed.
```

Paper:
ReAct: Synergizing Reasoning and Acting in Language Models

---

# 8. Plan-and-Execute

Separate planning from execution.

```
Goal

↓

Planner

↓

Plan
 ├── Step 1
 ├── Step 2
 └── Step 3

↓

Executor executes each step
```

Useful for

* agents
* robotics
* workflows

---

# 9. Least-to-Most Prompting

Break difficult tasks into smaller ones.

```
Hard problem

↓

Easy problem 1

↓

Easy problem 2

↓

Easy problem 3

↓

Final answer
```

Excellent for symbolic reasoning.

---

# 10. Reflexion

The model critiques its own mistakes.

```
Attempt

↓

Evaluation

↓

Reflection

↓

Improved attempt
```

Similar to human debugging.

---

# 11. Self-Refine

An iterative improvement loop.

```
Draft

↓

Critique

↓

Rewrite

↓

Critique

↓

Rewrite
```

Useful for writing and code.

---

# 12. Constitutional AI

Instead of only RLHF:

```
Answer

↓

Check against principles

↓

Revise

↓

Output
```

Developed by Anthropic.

---

# 13. Debate

Two (or more) models argue.

```
Question

↓

Model A
     ↘
      Judge
     ↗
Model B
```

The judge picks the stronger argument.

---

# 14. Retrieval-Augmented Generation (RAG)

Instead of relying only on model memory:

```
Question

↓

Retriever

↓

Documents

↓

LLM

↓

Answer
```

Essential for enterprise AI.

Variants include:

* Graph RAG
* Hybrid RAG
* Agentic RAG
* Multi-hop RAG

---

# 15. Agentic RAG

The model decides:

* what to search
* when to search
* whether more searches are needed

```
Question

↓

Plan

↓

Search

↓

Read

↓

Search Again?

↓

Answer
```

---

# 16. Tool Use / Function Calling

The LLM invokes external tools.

```
Question

↓

LLM

↓

Calculator
Database
Search
Python
API

↓

LLM

↓

Answer
```

Modern models from OpenAI, Google, and Anthropic support structured tool use.

---

# 17. Multi-Agent Systems

Several specialized agents collaborate.

```
User

↓

Manager

├── Research Agent
├── Coding Agent
├── Planning Agent
├── Reviewer

↓

Final Answer
```

Examples include frameworks like Microsoft AutoGen and CrewAI.

---

# 18. Reflection Loops

```
Think

↓

Answer

↓

Critique

↓

Improve

↓

Repeat
```

Widely used in coding agents.

---

# 19. Monte Carlo Tree Search (MCTS)

Borrowed from game AI.

```
          Root
        /   |   \
      Try Try Try
      |      |
   Simulate Simulate

↓

Best path
```

Increasingly used for code generation and planning by exploring many candidate solutions before choosing one.

---

# 20. Program-Aided Language Models (PAL)

Instead of doing calculations mentally:

```
Question

↓

Generate Python

↓

Run Python

↓

Answer
```

Very effective for mathematical reasoning.

---

# 21. Program of Thoughts (PoT)

A hybrid of CoT and code execution:

```
Reason

↓

Write Program

↓

Execute

↓

Reason

↓

Answer
```

---

# 22. Mixture of Experts (MoE)

This is a **model architecture**, not a prompting strategy.

```
Input

↓

Router

↓

Expert 1
Expert 7
Expert 25

↓

Combine

↓

Output
```

Only a subset of expert networks are activated for each token, improving efficiency and capacity.

---

# 23. Test-Time Scaling / Deliberative Reasoning

Rather than always answering immediately, the model uses additional computation at inference time to improve difficult answers. This can involve generating multiple reasoning paths, verifying intermediate results, using tools, or revising solutions before responding. Many recent frontier models employ forms of adaptive test-time reasoning.

---

# Comparison

| Strategy          | Main Idea                           | Best For                     |
| ----------------- | ----------------------------------- | ---------------------------- |
| Chain-of-Thought  | Linear reasoning                    | Math, logic                  |
| Self-Consistency  | Multiple reasoning paths + vote     | Accuracy                     |
| Tree of Thoughts  | Search over reasoning branches      | Planning, puzzles            |
| Graph of Thoughts | Graph-structured reasoning          | Complex dependencies         |
| ReAct             | Alternate reasoning and actions     | Agents                       |
| Plan-and-Execute  | Plan first, execute second          | Workflows                    |
| Least-to-Most     | Decompose into simpler tasks        | Symbolic reasoning           |
| Reflexion         | Learn from mistakes                 | Coding, planning             |
| Self-Refine       | Iterative revision                  | Writing, code                |
| Debate            | Multiple models argue               | Robustness                   |
| RAG               | Retrieve external knowledge         | Enterprise QA                |
| Agentic RAG       | Adaptive retrieval                  | Research assistants          |
| Tool Use          | Call external tools                 | APIs, databases, calculators |
| Multi-Agent       | Specialized collaborating agents    | Complex automation           |
| PAL / PoT         | Execute generated code              | Math, data analysis          |
| MCTS              | Search many candidate solutions     | Coding, planning             |
| MoE               | Sparse expert architecture          | Efficient large models       |
| Test-Time Scaling | Spend more compute on hard problems | High-quality reasoning       |

### A useful way to think about these strategies

They fall into four broad categories:

* **Reasoning strategies:** Chain-of-Thought, Self-Consistency, Tree/Graph of Thoughts, Least-to-Most, PAL, PoT.
* **Planning and execution strategies:** ReAct, Plan-and-Execute, Reflection, Reflexion, Self-Refine, MCTS.
* **Knowledge augmentation strategies:** RAG, Agentic RAG, Tool Use, Function Calling.
* **Architectural strategies:** Mixture of Experts, sparse routing, memory-augmented models, and other model designs that affect how the LLM computes internally.

These approaches are often combined in modern AI systems. For example, a coding agent might use ReAct to decide when to search documentation, RAG to retrieve API references, Tool Use to run tests, Reflection to fix failures, and Test-Time Scaling to explore multiple repair strategies before returning the final code.
