Get to Know Search Index Types in Data 360
Learning Objectives
After completing this unit, you’ll be able to:

Describe the search indexes supported in Data 360.
Identify which search index to build for your use case.
Use Search in Data 360 to Ground AI
Grounding AI on customer-specific data enhances the value of generative AI in applications, analytics, and automation tools across the Salesforce Platform. Grounding AI can be achieved with unstructured, semi-structured, or structured data. By using the user query to retrieve the relevant CRM data for grounding the AI model, applications like Agentforce, Tableau, and Flow Builder ensure that outputs are finely tuned to your users’ intent. Use search in Data 360 to ensure accurate and relevant AI-generated content, deeper insights from analytics, and more efficient automation workflows for your teams and customers.

In Data 360 you can build search indexes on any data, including unstructured data in knowledge bases. Data 360 supports the following search index types.

Vector search index
Hybrid search index
Enriched search index
To build search indexes in Data 360, bring your data into Data 360. Data 360 ingests unstructured data, maps it to standard data model objects (DMO) or unstructured data model objects (UDMO), and creates meaningful content chunks from the data. Data 360 then creates vector embeddings to build a search index that helps applications understand semantic and lexical similarities with the data.

Note
To learn the definitions of vector embeddings and other Data 360 terms, refer to Data 360 Glossary of Terms.

Select a Search Index Type
Before you decide which search index type is best suited for your specific use case and data set, let us first dig into how these search types differ from each other and what type of search queries result in the most relevant response.

Vector Search Index
Vector search, also known as semantic search, involves retrieving semantically similar data (or data chunks) for a given search query. This data can also include videos, audio, and call transcripts. Vector search retrieval is done by chunking the data, creating vector embeddings, and searching for vector embeddings that have close semantic similarities to the search query.

Data from various data sources ingested into Data 360. Data 360 chunks the data and creates vector embeddings to build a vector index. C360 applications like Tableau, Agentforce, and so on, then query this vector index and get relevant results.


Vector search works well for long-form search queries where the users are looking for general information. The search query retrieves data that has a high vector search score that correlates to closest semantic matches.

For example, here’s a query looking for information about how Google Chrome browser works. The search query retrieves chunks that have the highest vector search score which relates to the closest semantic match with the search query.


Query:


select c.Chunk_c, v.score_c from vector_search(table(WikiArticle_c_vector_search_2_index__dlm), 'how does Google Chrome internet browser work', '', 100) as v join WikiArticle_c_vector_search_2_ chunk_dlm as c on v.SourceRecordId_c=c.RecordId_c ORDER by v.score_c desc limit 3;
Copy to Clipboard
select c.Chunk_c, v.score_c from vector_search(table(WikiArticle_c_vector_search_2_index__dlm),
 'how does Google Chrome internet browser work', '', 100) as v join WikiArticle_c_vector_search_2_
chunk_dlm as c on v.SourceRecordId_c=c.RecordId_c ORDER by v.score_c desc limit 3;

Result:

The image shows query results for a vector search in the descending order of vector search score. Chunks of data that have the closest semantic match to the search query are at the top of the results.

Hybrid Search Index
Hybrid search combines the strengths of semantically aware vector search with the ability of keyword search to handle domain vocabulary. Hybrid search merges the retrieved information from both types of searches and then ranks the results using a fusion ranker function to show the most relevant information.


The default hybrid search fusion ranker function is optimized on internal benchmarks for a variety of search-based tasks. The training and evaluation data is based on actual captured queries from Einstein Search and Gen-AI applications like Einstein Search Answers.


Data from various sources are ingested into Data 360. Data 360 chunks the data and creates vector embeddings. From the chunked and vectorized data, Data 360 builds a vector search index and a keyword search index. The hybrid search fusion ranker function then ranks the retrieved result and provides the most relevant response to C360 apps querying the data.

Hybrid search is a great option for long form search queries where specific search terms are also included. The search query retrieves data that has a high keyword search score that correlates to exact keyword matches and high vector search score that correlates to the closest semantic matches. This results in retrieving data with a high hybrid search score that correlates to the most relevant search results.

For the same query example we used for vector search, keyword search promotes higher ranking positions for more relevant content, thus providing the LLM with better grounding.


Query:

select c.Chunk__c, h.hybrid_score__c, h.keyword_score__c, h.vector_score__c from hybrid_search(table(WikiArticle_c_hybrid_search_2_index__dlm), 'how does Google Chrome internet browser work ?', '', 100) as h join WikiArticle_c_hybrid_search_2_chunk__dlm as c on h.SourceRecordId__c=c.RecordId__c ORDER by h.hybrid_score__c desc limit 2;
Copy to Clipboard
select c.Chunk__c, h.hybrid_score__c, h.keyword_score__c, h.vector_score__c from
hybrid_search(table(WikiArticle_c_hybrid_search_2_index__dlm), 'how does Google Chrome
internet browser work ?', '', 100) as h join WikiArticle_c_hybrid_search_2_chunk__dlm
as c on h.SourceRecordId__c=c.RecordId__c ORDER by h.hybrid_score__c desc limit 2;
Result:

The image shows query results for a hybrid search in the descending order of hybrid search score. Chunks of data that have the closest semantic and keyword match to the search query are at the top of the results.

Note
For the same query in the Google Chrome example used, hybrid search is much more powerful than a pure vector search as it returns chunks that include both information about how browsers work along with specific details on Google Chrome browser.

Enriched Search Index
Enrich standard content chunks with additional metadata and question chunks to enhance a vector search index or hybrid search index for retrieval augmented generation (RAG).

Automatically extracting metadata that include keywords, entities, topic overviews, questions answered by the content, and content summaries from content chunks significantly boosts retrieval accuracy. This LLM-generated enrichment acts as an alternative to manual curation, making it much easier for AI agents to identify the most relevant information when answering questions.

To use it, you turn on enriched chunks when creating a vector search index or a hybrid search index. When you build the search index, Data 360 generates three new chunks: one plain chunk that contains the original chunk text, one chunk that contains metadata text, and one chunk that contains questions that the chunk can answer. Create retrievers in AI Models for enriched search indexes. Use the retrievers in prompt templates and agents for RAG and agent workflows.

Now, let’s look at a sample query for an enriched hybrid search index that includes the enriched chunks in the results.

Query:

SELECT "RagFileUDMO_Enriched_chunk"."Chunk__c" AS "Chunk", "searchFunc"."hybrid_score__c" AS "hybrid_score__c", "searchFunc"."SourceChunks__c" AS "SourceChunks__c", "searchFunc"."ChunkProcessingType__c" AS "ChunkProcessingType__c", "RagFileUDMO_Enriched_chunk"."ChunkType__c" AS "ChunkType__c" FROM ( SELECT * FROM hybrid_search(TABLE("RagFileUDMO_Enriched_index__dlm"), 'What is the purpose of Multi-Terrain Select system?', 'ChunkProcessingType__c = ''PLAIN''', 10) UNION SELECT * FROM hybrid_search(TABLE("RagFileUDMO_Enriched_index__dlm"), 'What is the purpose of Multi-Terrain Select system?', 'ChunkProcessingType__c = ''QUESTION''', 10) UNION SELECT * FROM hybrid_search(TABLE("RagFileUDMO_Enriched_index__dlm"), 'What is the purpose of Multi-Terrain Select system?', 'ChunkProcessingType__c = ''METADATA''', 10) ) AS "searchFunc" INNER JOIN "RagFileUDMO_Enriched_chunk__dlm" AS "RagFileUDMO_Enriched_chunk" ON "RagFileUDMO_Enriched_chunk"."RecordId__c" = "searchFunc"."RecordId__c" INNER JOIN "RagFileUDMO__dlm" AS "RagFileUDMO" ON "RagFileUDMO"."FilePath__c" = "RagFileUDMO_Enriched_chunk"."SourceRecordId__c" AND "RagFileUDMO"."KQ_FilePath__c" IS NOT DISTINCT FROM "RagFileUDMO_Enriched_chunk"."KQ_SourceRecordId__c" ORDER BY "searchFunc"."hybrid_score__c" DESC
Show More
Copy to Clipboard
SELECT
      "RagFileUDMO_Enriched_chunk"."Chunk__c" AS "Chunk",
	  "searchFunc"."hybrid_score__c" AS "hybrid_score__c",
      "searchFunc"."SourceChunks__c" AS "SourceChunks__c",
      "searchFunc"."ChunkProcessingType__c" AS "ChunkProcessingType__c",
      "RagFileUDMO_Enriched_chunk"."ChunkType__c" AS "ChunkType__c"
  FROM (
      SELECT * FROM hybrid_search(TABLE("RagFileUDMO_Enriched_index__dlm"),
  'What is the purpose of Multi-Terrain Select system?', 'ChunkProcessingType__c
   = ''PLAIN''', 10)
      UNION
      SELECT * FROM hybrid_search(TABLE("RagFileUDMO_Enriched_index__dlm"),
  'What is the purpose of Multi-Terrain Select system?', 'ChunkProcessingType__c
   = ''QUESTION''', 10)
      UNION
      SELECT * FROM hybrid_search(TABLE("RagFileUDMO_Enriched_index__dlm"),
  'What is the purpose of Multi-Terrain Select system?', 'ChunkProcessingType__c
   = ''METADATA''', 10)
  ) AS "searchFunc"
  INNER JOIN "RagFileUDMO_Enriched_chunk__dlm" AS "RagFileUDMO_Enriched_chunk"
      ON "RagFileUDMO_Enriched_chunk"."RecordId__c" = "searchFunc"."RecordId__c"
  INNER JOIN "RagFileUDMO__dlm" AS "RagFileUDMO"
      ON "RagFileUDMO"."FilePath__c" =
  "RagFileUDMO_Enriched_chunk"."SourceRecordId__c"
      AND "RagFileUDMO"."KQ_FilePath__c" IS NOT DISTINCT FROM
  "RagFileUDMO_Enriched_chunk"."KQ_SourceRecordId__c"
  ORDER BY "searchFunc"."hybrid_score__c" DESC
Result:

The image shows query results for an enriched hybrid search index with the original source chunk listed as a plain chunk, a question chunk, and a metadata chunk. All three chunks are part of the retrieved result that have the closest hybrid search and metadata match to the search query.

Use of this feature in Data Cloud consumes Flex Credits. For more information see, Billing Considerations for Enriched Index. Contact your account executive for more information.


In Summary
Build search indexes in Data 360 to ground AI on your organization’s unstructured, semi-structured, or structured data.

Select a search type that works best for the search queries from your end users and applications. If your users’ queries are mainly about general information or the queries are long (more than five words), then a vector search is sufficient for this scenario. Vector search provides relevant results when a user query has contextual content, which is usually longer queries.

To get the most accurate and relevant results that combine both semantic search matches and keyword search matches for a query, create a hybrid search index.

Enrich search indexes with additional metadata and question chunks where higher retrieval accuracy provides measurable value to offset higher costs involved in generating additional chunks using Large Language Models (LLMs).

Resources
Salesforce Help: Unstructured Data in Data 360
Salesforce Help: Vector Search
Salesforce Help: Hybrid Search
Salesforce Engineering Blog Post : How Data Cloud Hybrid Search Combines Keyword and Vector Retrieval to Elevate the Search Experience
Quiz
To complete this unit, you need to answer all the quiz questions correctly.
+100 Points

1
What are the key components of a hybrid search index?

A
Vector search index and keyword search index

B
Vector search index, keyword search index, and the fusion ranker service

C
Keyword search index and a fusion ranker service

D
Chunks and vector embeddings

2
Which search type is the most efficient to get the best of both a semantic match and a keyword match for a search query?

A
Vector search

B
Hybrid search

C
Keyword search

D
Enriched search