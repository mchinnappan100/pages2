# RAG Test Document

## What is RAG?
Retrieval-Augmented Generation (RAG) is a technique that combines document retrieval
with large language model generation. Instead of relying on a model training data
alone, RAG fetches relevant passages from your own documents and passes them as
context to the LLM before generating an answer.

## sf-rust RAG pipeline
1. Load: read txt, md, html, apex, json, rs files from a file or directory
2. Chunk: split documents into overlapping word windows
3. Embed: call Ollama or OpenAI to get float vectors per chunk
4. Search: embed the question, cosine similarity against all chunk vectors, top-K
5. Answer: pass retrieved chunks as context to Ollama / Claude / OpenAI

## Running RAG on mac-mini
Use the sf-rust binary at ~/sf-rust/sf-rust with the rag subcommand.
Point --doc at ~/rag/test to index all these test documents.
Use nomic-embed-text as the embedding model.
Choose any LLM: gemma4 for balanced speed, qwen3.8 for deep reasoning,
glm-4.7-flash for fast answers, nimble for lightweight use.

## Available Ollama models on this machine
- nomic-embed-text  : embedding model, use with --embedding-model
- qwen3.8           : large model, strong reasoning
- glm-4.7-flash     : fast, good for factual Q&A
- gemma4            : balanced quality and speed
- nimble            : lightweight general Q&A

## Tips
- Use --show-sources to see which chunks were retrieved
- Use --top-k to increase or decrease retrieved chunks
- Use --chunk-size 1000 for larger context models like qwen3.8
- Use --include to restrict indexing to specific file types
