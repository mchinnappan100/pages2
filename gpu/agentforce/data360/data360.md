Explore Data 360 and Agentforce
Learning Objectives
After completing this unit, you’ll be able to:

Explain why Data 360 is required for Agentforce.
Identify benefits of building agents that use unified customer 360 data from Data 360.
Note
As of October 14, 2025, Data Cloud has been rebranded to Data 360. During this transition, you may see references to Data Cloud in our application and documentation. While the name is new, the functionality and content remains unchanged.

Before You Start
Before you start this module, consider completing this recommended content.

Data 360-Powered Experiences
Agentforce Basics
Note
All features described in this module consume Data 360 credits. Learn more in Data 360 Credit Consumption: Quick Look and Salesforce Digital Wallet: Quick Look.

Explore How Data 360 and Agentforce Interact
You took the plunge and got Agentforce in your Salesforce org. You’re excited to build AI agents that know your customers and business. Let’s explore how Data 360 relates to Agentforce so you understand the connection and how to use them together.

There are two layers of Data 360 for Agentforce: enablement and implementation.

Enabling means you provisioned and enabled Data 360 in your org.
Implementing means you enabled Data 360 in your org, connected data, and mapped it to data models. You also may have harmonized data with identity resolution rulesets and set up other Data 360 features.
Enabling and implementing Data 360 impacts Agentforce capabilities.

Data 360 enabled: Data 360 must be provisioned and enabled for all Agentforce use. Agentforce features such as the Agentforce Data Library and Einstein Trust Layer don’t work without Data 360.
Data 360 implemented: When you implement Data 360, you gain benefits such as diverse customer 360 data, powerful data cleansing and transformation capabilities, and fully customizable RAG. To build a robust agent workforce and support complex requirements, you need to implement Data 360.
In this module, you learn how enabling and implementing Data 360 impacts your agents. Data 360 and Agentforce work together to give you effective, trusted agents grounded in your enterprise data. To understand why you need Data 360, you explore how Agentforce capabilities are powered by Data 360. You learn if you need Data 360 enabled or implemented for each capability. You also learn how to implement Data 360 for Agentforce by following a use case.

You begin by exploring how Data 360 provides a foundation for effective, personalized agents.

Data 360 Implemented: Agents Built on Customer 360 Data
When Data 360 is fully implemented, it offers a robust, secure data foundation that gives agents access to unified customer 360, transformed, real-time, and zero-copy data. In the table, explore some key aspects of a Data 360 foundation and how they impact agents.

In the NTO Example column, follow an example with Northern Trail Outfitters (NTO), a fictional apparel company. NTO built a service agent that handles customer inquiries, including recommending products, refunding orders, and offering promotions.

Data 360 Foundation

Description

Agentforce Impact

NTO Example

Unified Customer 360

Bring together data from across Salesforce and beyond, run identity resolution rulesets, and build a unified profile of each customer with full historical context across data sources.

Agents built on Data 360 data know your customers inside and out, from their purchases in Sales Cloud to their engagements in Marketing Cloud.

Instead of generic or disjointed responses, agents can give personalized responses that consider the customer’s actions across the company.

A customer asks NTO’s agent for a product recommendation.
With unified profiles, the agent can see the customer’s recent purchase: shoes from NTO’s new line. The agent also sees that the customer recently engaged with the line’s marketing campaign, specifically by clicking on the jacket and shoes.
Since the customer already purchased the shoes, the agent recommends the jacket.
Data Transforms

Cleanse and transform data. Resolve data quality issues, such as inconsistent naming and formats.

Clean data improves agent accuracy, consistency, and reliability. Without clean data, the agent is more likely to give incorrect or ambiguous responses, or no response at all.

NTO just ingested order records from Agentforce Commerce into Data 360. NTO hasn’t had time to clean the data yet.

A customer asks NTO’s agent to refund their order.
NTO’s agent looks up the order number in Data 360. However, the date on the order record is in DD/MM/YY format. NTO’s policy is that returns must be processed within 30 days, but the formula only works with MM/DD/YY dates.
NTO’s agent is unable to process a refund.
NTO runs a data transform to convert all dates to MM/DD/YY format. Now agents can successfully process refunds!

Real-Time Data

Ingest, unify, analyze, and act on data in real time.

Create agents that know current customer actions and react in seconds.

As a customer browses NTO’s website, they open the agent chat and ask for current promotions.
The agent sees the customer’s interactions in real time, and recognizes that the customer is clicking on backpacks.
Instead of recommending every active promotion, the agent gives the customer the most relevant promotion: buy one get one on select backpacks.
Zero Copy

Connect data stored outside Salesforce using Zero Copy. Zero Copy lets you create bidirectional communications between Data 360 and external systems, so you can access data freely without duplicating it.

Expand the reach of your agents beyond Salesforce.

NTO stores loyalty program data in Databricks. They use a zero-copy connection to bring the data into Data 360 and enrich unified profiles.

A customer asks NTO’s agents for current promotions.
The agent looks up the customer’s unified profile, which has been enriched with loyalty program data.
The agent sees that the customer is a platinum member, which entitles them to an exclusive promotion.
NTO’s agent recommends the exclusive promotion.
While there are other options for ingesting data for Agentforce use, Data 360 is the only one that supports a holistic 360 strategy with unified data.

CRM Data via Fileforce: Only ingests unstructured CRM data, doesn’t unify data.
Agentforce via Agentforce Data Library (uses Data 360 storage): Only ingests unstructured data, doesn’t unify data.
Next Up
In this unit, you discovered how agents built on Data 360 benefit from access to unified, transformed, real-time, and zero-copy data. After connecting sources and transforming data in Data 360, you’re ready to set up Retrieval Augmented Generation (RAG).

Resources
Salesforce Help: Better Together: Data and AI
Salesforce Blog: The Force Behind Agentforce: How Data Cloud Fuels Agent-First Enterprises
Salesforce Help: Set Up and Maintain
Trailhead: Data and Identity in Data 360
Salesforce Help: Unify Source Profiles
Trailhead: Batch Data Transforms in Data 360: Quick Look
Trailhead: Streaming Data Transforms in Data 360: Quick Look
Salesforce Help: Data Cleansing and Preparation
Trailhead: Real-Time Use Cases in Data 360
Salesforce Help: Real-Time Capabilities in Data 360
Trailhead: Data 360 with Zero Copy
Salesforce Help: Zero Copy Data Federation
Quiz
To complete this unit, you need to answer all the quiz questions correctly.
+100 Points

1
What steps do you need to follow to have access to Data 360’s robust data foundation?

A
Enable Data 360 by provisioning and enabling it in your org.

B
Purchase Data 360 and email your admins to set it up.

C
Create a Zero Copy connection to connect Agentforce to Data 360.

D
Implement Data 360 by provisioning and enabling it, then connecting, transforming, and mapping data.

2
Why is unified customer 360 data in Data 360 beneficial for agents?

A
It restricts agents to only using structured CRM data.

B
It enables agents to provide personalized responses that consider a customer’s actions and full context.

C
It completely eliminates the need for data cleansing and transformation.

D
It enables agents to offer generic responses to all customers, regardless of their history.