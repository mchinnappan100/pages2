The Hugging Face **Transformers** library is the de facto standard Python library for using pretrained Transformer models (LLMs, vision models, speech models, multimodal models). It provides thousands of models with a unified API.

## 1. Install

```bash
pip install transformers
```

For PyTorch:

```bash
pip install torch transformers
```

For TensorFlow:

```bash
pip install tensorflow transformers
```

---

## 2. The Main Components

```
                    Hugging Face Transformers

              +-------------------------------+
              |        AutoTokenizer          |
              +-------------------------------+
                           |
                    Converts text -> tokens
                           |
                           v
              +-------------------------------+
              |         AutoModel             |
              |    (or AutoModelFor...)       |
              +-------------------------------+
                           |
                   Runs Transformer model
                           |
                           v
              +-------------------------------+
              |          Outputs              |
              | logits, embeddings, etc.      |
              +-------------------------------+
```

The library automatically loads the correct tokenizer and model.

---

## 3. Text Generation Example

```python
from transformers import pipeline

generator = pipeline(
    "text-generation",
    model="gpt2"
)

result = generator(
    "The future of AI is",
    max_new_tokens=50
)

print(result[0]["generated_text"])
```

Output

```
The future of AI is exciting because...
```

The `pipeline()` API is the easiest way to get started.

---

## 4. Loading a Tokenizer

```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
```

Tokenize text

```python
text = "Hello Transformers!"

tokens = tokenizer(text)

print(tokens)
```

Output

```python
{
 'input_ids': [101, 7592, 19081, 999, 102],
 'attention_mask': [1,1,1,1,1]
}
```

---

## 5. Convert Tokens Back

```python
ids = tokenizer.encode("Hello world")

print(ids)

print(tokenizer.decode(ids))
```

Output

```
[101, 7592, 2088, 102]

Hello world
```

---

## 6. Loading a Model

```python
from transformers import AutoModel

model = AutoModel.from_pretrained(
    "bert-base-uncased"
)
```

This loads pretrained weights automatically.

---

## 7. Running Inference

```python
from transformers import AutoTokenizer
from transformers import AutoModel

import torch

tokenizer = AutoTokenizer.from_pretrained(
    "bert-base-uncased"
)

model = AutoModel.from_pretrained(
    "bert-base-uncased"
)

inputs = tokenizer(
    "Transformers are amazing!",
    return_tensors="pt"
)

outputs = model(**inputs)

print(outputs.last_hidden_state.shape)
```

Output

```
torch.Size([1, 6, 768])
```

Meaning:

```
(batch_size,
 sequence_length,
 hidden_dimension)
```

---

## 8. Sequence Classification

```python
from transformers import pipeline

classifier = pipeline(
    "sentiment-analysis"
)

print(classifier("I love Transformers"))
```

Output

```python
[
 {'label':'POSITIVE',
  'score':0.9998}
]
```

---

## 9. Question Answering

```python
from transformers import pipeline

qa = pipeline("question-answering")

context = """
Paris is the capital of France.
"""

question = "What is the capital of France?"

print(qa(
    question=question,
    context=context
))
```

Output

```python
{
 'answer':'Paris'
}
```

---

## 10. Summarization

```python
summarizer = pipeline(
    "summarization"
)

summary = summarizer(long_text)

print(summary[0]["summary_text"])
```

---

## 11. Translation

```python
translator = pipeline(
    "translation_en_to_fr"
)

translator("How are you?")
```

---

## 12. Using a Chat Model

Many modern instruction-tuned models expose a chat template.

```python
from transformers import AutoTokenizer
from transformers import AutoModelForCausalLM

import torch

model_name = "Qwen/Qwen2.5-1.5B-Instruct"

tokenizer = AutoTokenizer.from_pretrained(model_name)

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype="auto",
    device_map="auto"
)

messages = [
    {"role": "user", "content": "Explain transformers."}
]

text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True
)

inputs = tokenizer(
    text,
    return_tensors="pt"
).to(model.device)

outputs = model.generate(
    **inputs,
    max_new_tokens=200
)

print(tokenizer.decode(outputs[0]))
```

---

## 13. Computing Embeddings

```python
from transformers import AutoTokenizer
from transformers import AutoModel

import torch

tokenizer = AutoTokenizer.from_pretrained(
    "bert-base-uncased"
)

model = AutoModel.from_pretrained(
    "bert-base-uncased"
)

inputs = tokenizer(
    "Deep learning",
    return_tensors="pt"
)

with torch.no_grad():
    outputs = model(**inputs)

embedding = outputs.last_hidden_state.mean(dim=1)

print(embedding.shape)
```

Output

```
torch.Size([1,768])
```

---

## 14. Common AutoModel Classes

| Class                                | Purpose                                            |
| ------------------------------------ | -------------------------------------------------- |
| `AutoModel`                          | Base Transformer model (embeddings, hidden states) |
| `AutoModelForCausalLM`               | GPT/Llama/Qwen-style text generation               |
| `AutoModelForMaskedLM`               | BERT masked-token prediction                       |
| `AutoModelForSequenceClassification` | Sentiment, spam, document classification           |
| `AutoModelForTokenClassification`    | Named Entity Recognition (NER)                     |
| `AutoModelForQuestionAnswering`      | Extractive QA                                      |
| `AutoModelForSeq2SeqLM`              | Translation, summarization (e.g., T5, BART)        |
| `AutoModelForImageClassification`    | Vision models                                      |
| `AutoModelForSpeechSeq2Seq`          | Speech-to-text                                     |

---

## 15. Typical Workflow

```text
                Raw Text
                    │
                    ▼
          AutoTokenizer
                    │
                    ▼
             input_ids
        attention_mask
                    │
                    ▼
               AutoModel
                    │
                    ▼
          Hidden Representations
                    │
        ┌───────────┼────────────┐
        ▼           ▼            ▼
 Text Generation  Classification Embeddings
```

---

## 16. Training / Fine-Tuning

The library also supports fine-tuning using the `Trainer` API.

```python
from transformers import Trainer
from transformers import TrainingArguments

training_args = TrainingArguments(
    output_dir="./results",
    per_device_train_batch_size=8,
    num_train_epochs=3,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
)

trainer.train()
```

---

## 17. Learning Path

1. Learn `AutoTokenizer` and tokenization.
2. Use `pipeline()` for quick experiments.
3. Load models with `AutoModelForCausalLM` for generation tasks.
4. Understand `generate()` and decoding options (temperature, top-k, top-p, beam search).
5. Work with datasets using the companion **Datasets** library.
6. Fine-tune models with `Trainer` or custom PyTorch loops.
7. Explore efficient inference techniques such as quantization and optimized attention for larger models.

Once you're comfortable with these building blocks, you'll be able to use most Transformer models with only a few lines of code, regardless of whether they're for language, vision, audio, or multimodal tasks.
