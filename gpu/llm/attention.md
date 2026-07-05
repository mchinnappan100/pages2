When text is first fed into a large language model, it is broken down into smaller pieces called tokens, and each token is assigned a unique ID. Because these IDs alone do not capture semantic meaning, the model maps them into d-dimensional vectors known as "token embeddings," where words with similar meanings are placed close to each other in the vector space. 

**The primary limitation at this initial stage is that these token embeddings exist in isolation.** They represent the general meaning of a word, but they lack any awareness of the surrounding sequence or the specific context in which the word is being used. 

To solve this limitation, the model applies the **attention mechanism**, which updates these isolated embeddings with contextual information. Here is how the process works in more detail:

*   **Measuring Relationships:** The model extracts "query" and "key" vectors from the initial embeddings and measures the relationship between tokens by computing the dot product of these vectors. 
*   **Assigning Influence:** This calculation produces **attention scores**, which indicate exactly how much influence each token should have when updating the embedding of a particular token. 
*   **Gathering Context:** Using these attention scores, the model computes a weighted sum of "value" vectors, effectively extracting the relevant contextual information that needs to be transferred between tokens. 
*   **Updating the Embeddings:** Finally, this aggregated contextual information is converted back to the original embedding dimensionality and added to the original token embeddings. 

**Through this self-attention process, the refined token embeddings are updated to capture relevant details and relationships from the entire sequence**, ensuring the model understands the full context of the prompt.