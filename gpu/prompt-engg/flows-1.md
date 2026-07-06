Make Your Flows Agent-Ready
Learning Objectives
After completing this unit, you’ll be able to:

Create a flow that can be assigned to an agent action.
Write useful names and descriptions for resources in an agent action’s flow.
Create appropriate variables in an agent action flow.
Limit the data that your agent and its related flows have access to.
Note
This badge assumes you’re familiar with flows and have experience with Flow Builder. Follow the Build Flows with Flow Builder trail to build strong process automation skills and become a Flow Builder expert.

Why You Should Use Flows in Agents
Agentforce is an incredibly powerful tool for your users and customers, and much of that power comes from flows. Though agents can access Salesforce data, they can’t affect that data without an agent action. If you want your agent to create, update, or delete records, you need to define an agent action that changes the data. Agent actions can call Apex classes, make API calls, run flows, or reference a prompt template, but flows are the only method that can change your Salesforce org’s data in a low-code fashion.

Flows also provide an extra level of accuracy when ensuring that the agent is working with specific data. Agents can read any Salesforce data that you give them permissions to read, and use any data that they think is relevant. To limit the data that the agent uses and greatly increase the agent’s accuracy, create a flow that retrieves specific, precise data to feed to the agent. Then give the agent instructions to use only the data provided by the flow.

So what do you need to do to create a flow-based agent action?

Create an Autolaunched Flow (No Trigger)
Agent actions support only flows of the Autolaunched Flow (No Trigger) flow type. While other flow types—such as record-triggered flows—can technically qualify as autolaunched, the assigned flow must be of the No Trigger type specifically. If you want to use an existing flow in an agent action and it’s not this type, you must re-create the flow using the Autolaunched Flow (No Trigger) flow type.

Be Very Descriptive
AI technology relies heavily on words. To get good results when you ask an AI to generate text, you must give it detailed instructions, and it must have detailed, accurate source text. The same is true for any flow you want to run as an agent action.

Agents use the flow’s variable names, as well as the data that the flow is working with, to understand what the flow does. So it’s important to have accurate, descriptive names for your flow’s input and output variables. Avoid variable names like “foo”. Instead, use descriptive variable names like “Account_ID”.

While it’s already best practice to add descriptions to everything in a flow, it’s even more important when the flow is run by an agent action. Agents use the flow’s description and the descriptions on its variables. All of this text helps the agent understand the flow’s functionality and the data that the flow is working with. Without a solid name and description, the agent can’t reliably determine what to do with a variable and its data.

Here are some examples of good and not so good descriptions.

Text type

Less effective description

More effective description

Flow description

Updates a phone number

Update the user’s phone number associated with their contact record. If no matching contact exists, create a new contact record.

Flow output variable name

OrderColl

Sorted_Cupcake_Orders_Collection

Flow output variable description

A collection of cupcake orders

A collection of the customer’s cupcake orders, matching the email address given by the customer, sorted by most recent.

Note
Note that the flow description is more directive than the other descriptions. That’s because when you add a flow to an agent, the flow’s description automatically becomes an instruction for the agent. Save time by writing the initial flow description in the form of an agent instruction.

Always Use Input and Output Variables
Flow-based agent actions always require at least one input variable and at least one output variable in the flow. Even if these variables weren’t required, it would still be best practice to use input and output variables. Your flows are more precise when you give them more context, and your agents perform better when their flows send the right data.

Even if you can’t think of any data to pass to the agent, there’s still something you should always consider sending in an output variable: error messages. Agents expect some kind of result from a flow, even if that result is simply the flow’s YOUR FLOW FINISHED message. But flows can fail, causing unexpected errors. Without any data from the flow, your agent will likely apologize and offer a generic “Something went wrong” message. Or it might present other data to the customer, without any context, just because it wants to present something.

To prevent this (and also to fulfill the output variable requirement), create an output variable designed to present more detailed and helpful error messages. Use fault paths and assignment elements in your flow to set the error message in an output variable. Then make sure you tell your agent how and when to use that output variable. You learn how to configure this in the following units.

Don’t Be Afraid of Record Variables
Record variables aren’t just for working within flows. Agents can receive record variables, too! If you need to send your agent multiple fields from a record, or even from multiple records, don’t create multiple variables. Instead, create a record variable or a record collection variable for that data, and make it available for output. Suppose your agent requests four fields from a customer’s open case. Instead of using four separate variables, you return those four case fields in one record variable. And if you want to return multiple cases, you can return them in a single record collection variable.

Your agent then receives all of that data and can make use of it. And if the agent’s instructions tell it to present the record data to the customer, the agent first organizes that data into a useful, readable format.

Don’t Let Your Flow Overfeed Your Agent
When an agent receives data from a flow, it tends to believe that the data should be used for something. It can use the data to make decisions, or it can show the data to the customer unnecessarily. It might even show the customer data that they shouldn’t see. Therefore, never give an agent any data that you don’t want it to use.

Unfortunately, this rule contradicts your flows’ default Get Records configuration. The default for the How to Store Record Data setting is “Automatically store all fields”, but your agents probably don’t need all those fields. Instead, select the “Choose fields and assign variables” setting, using a separate record variable, and select only the fields that the agent needs.

For the How to Store Record Data setting, select Choose fields and assign variables (advanced).

Give Your Agent the Right Permissions
Employee-facing agents use the permissions of the user that’s interacting with the agent, but external-facing agents use the permissions of a single dedicated user. Because agents can access all of your Salesforce data if they have the right permissions, and it’s risky to give agents access to too much data, it’s especially important to make sure that each agent’s dedicated user has only the permissions it needs. Resist the temptation to give it access to anything that it doesn’t really need.

To control an agent’s permissions, start by looking for the Agent User that’s assigned to that agent. You can view and change this user on the Agent Details page in Agentforce Builder.

The Agent User for the Coral Cloud Booking Agent is EinsteinServiceAgent User.

After you’ve identified the Agent User, give this user the permission sets, profiles, and roles they need to run their flows and fulfill your customers’ requests.

Build Lots of Smaller Flows, Not One Big Flow
Agents benefit from modular design: lots of small actions that complete one task each. These actions can be combined in many ways and reused across many agents.

So how do you know where to draw the line separating one flow from another? Think about how you associate flows with an agent: You create an agent action for each flow. When an agent is asked to take an action, the action itself usually defines the boundaries of the flow. For example, if an agent could be asked to change an opportunity’s stage, that’s one action, carried out by one flow. If the agent could also be asked to change the close date without changing the stage, then that’s a separate action, carried out by another flow. On the other hand, you don’t need a separate action and flow for each potential value of the Stage field, because the flow can use an Update Records element to set the field to whichever value is requested.

However, if the requested action meant updating both the Stage and Close Date at the same time, you could do that with one agent action flow, because that would be one request.

Interaction points are also a great way to set a flow’s boundaries. Agents can’t ask a customer for information mid-flow, so if your agent needs to present information or ask what to do next, that’s usually a good boundary. Imagine a subagent for managing opportunities where the agent might need to perform multiple tasks.

Ask the customer which opportunity to use.
Get data about that opportunity.
With the right data in hand, ask the customer how the agent can help.
Perform the customer’s requested action.
In this scenario, one flow can handle steps 1 and 2. The agent handles step 3. Step 4 should be one or more separate flows, depending on what else the agent can do with the customer's opportunity record.

Other Considerations
Here are some other considerations to keep in mind when you’re working with flows in agents.

Don’t Send Long Text Strings to a Variable
Text variables can contain only 255 characters, and characters that exceed that limit are truncated. Be careful when assigning unknown lengths of text to an input variable of the text data type. To send more than 255 characters of text to a flow, work with a developer to create an Apex-defined variable instead.

Make Text as Clear as Possible
Do everything you can to help your agent understand its context and instructions. Use complete sentences with proper grammar, spelling, and punctuation. If you’re entering text in a location where you can’t use spaces, such as a variable’s API Name, add underscores between words for increased clarity. For example, use Account_ING_Number instead of AccountINGNumber.

Avoid Incompatible Output Data Types
These complex data types can’t be passed back to the agent via output variables.

Currency
Picklist
Multi-Select Picklist
Apex-Defined
If your flow is configured to pass one of these data types to an agent, the agent can no longer handle any output variables.

Remake an Agent Action If You Change Its Flow’s Variables
When you create an agent action from a flow, the action takes a one-time snapshot of the flow’s input and output variables. That snapshot is static. It’s not updated if you change the flow’s variables. To avoid problems that can arise when the agent runs the flow with outdated variables, you must delete the agent action, make a new agent action, and assign the flow to the agent action.

