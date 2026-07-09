Explore Agent Testing Tools and Considerations
Learning Objectives
After completing this unit, you’ll be able to:

Explain the importance of testing agents.
Describe the tools you can use to test your agent.
Discuss considerations of agent testing and ways to mitigate them.
Before You Start
Before you start this module, consider completing this recommended content. These modules provide a foundation of knowledge that this module will build upon.

Trailhead: Agentforce: Agent Planning
Trailhead: Agentforce Builder Basics
Trailhead: The Einstein Trust Layer
Introduction
Artificial intelligence (AI) and the rise of AI Agents are reshaping how we think about software development. In many organizations, the very same Salesforce administrators and developers who’ve spent years administering or customizing Salesforce solutions are now charged with building Agentforce Agents. This requires a shift in their skills, the tools they use, and their mindset. While the familiar and traditional application lifecycle management (ALM) stages of ideation, configuration, testing, deployment, and observation also apply to the agent development lifecycle (ADL) process, tossing generative AI into the mix can add a few unexpected twists and turns, especially regarding agent testing.

A wheel showing the five stages of the Agent Development Lifecycle which include Ideate, Configure, Test, Deploy, and Observe.

In this module, you learn about tools available in Agentforce Studio to test and troubleshoot your agents, considerations to help you test, and testing strategies you can use to make your agent’s responses more accurate and predictable.

The Reasons to Test
If you’ve earned the Agentforce: Agent Planning badge, you followed along as Nora Alami at Coral Cloud Resorts planned an agent that could create and manage the customer experience. You learned about defining criteria like your audience, scope, use cases, guardrails, and the tasks it will perform. These specifications are the same things your testing should validate to make sure your agent’s performance aligns with the work you designed it to do.

Tools to Test and Troubleshoot Your Agent
Ensuring your agent responds accurately and predictably to user input can seem daunting, especially when you consider all of the user requests your subagents, actions, and guardrails need to be able to handle. With so many variables at play, the cause of an inaccurate response, an error message, or a hallucination might be inside an instruction, an action, data, or a permission set. That’s why Agentforce Studio gives you two levels of testing so you can feel confident that your agent is ready to provide reliable and predictable responses: preview testing in Agentforce Builder, and testing-at-scale in Test Suites (Beta).

Agentforce Builder Testing and Troubleshooting Tools
Agentforce Builder provides several tools that let you test conversations and review how the agent came up with its responses so you can iterate your agent before you launch it to your users. Let’s take a look.

Preview (1):It’s exciting when you get to the step in Agentforce Builder where you’re able to begin conversing with your agent in the Preview panel. The Preview panel lets you try out conversations your users might have with your agent so you can see if it responds the way you intended. You can choose between two Preview modes (2):

Simulate - Test your agent with mock data and actions.
Live Test - Use real data to see how your agent performs.
The output generated in Preview lets you see if your agent provides helpful and relevant responses, calls the right actions, references your business processes correctly, and stays within the guardrails you set.

Interaction Summary (3): Review the steps at a high level that the agent used to return its response, including the subagents and reasoning it called.

Agentforce Session Tracing (4): View every detail that happened during an agent session to investigate or troubleshoot agent interactions. Review reasoning engine executions, actions, prompt and gateway inputs/outputs, error messages, and final responses in text or code view (5), all tucked under the session ID for each session. Agentforce Session Tracing requires Data 360.

The Agentforce Builder Preview panel showing the prompt “I’d like to book a session of the Full Moon Beach Experience.” and the response, “To help you book a session for the Full Moon Beach Experience, I need to verify your details first. Could you please provide your email address and membership number?” It also shows the Interaction Summary panel showing the steps, including the input, subagent, reasoning, and output evaluation the agent used to reach its response, and the Session Tracing details and the session ID.

Agentforce Session tracing also comes in handy after your agent is launched because you can review the kinds of conversation exchanges your users have with your agents, including the input the agent was given and how it responded. This can help you locate and fix an issue or adjust your agent to handle input you hadn’t anticipated. Session tracing lets you know if you need to set additional guardrails, or refine your instructions or actions to give more targeted responses.

Agentforce Studio Test Suites
After you’ve refined your agent’s performance in Agentforce Builder, you’re ready to batch test it in Agentforce Studio Test Suites (Beta). To access Test Suites (Beta), from the App Launcher, open Agentforce Studio, and then click Tests.

The Agentforce Studio menu showing Tests selected..

You might be thinking, I already tested my agent in Preview in Agentforce Builder, why do I need to batch test it in Test Suites (Beta)? Well, it would take a very long time to think up every way a user could pose a question or interact with your agent and then test them one by one in the Preview window. Test Suites (Beta) simplifies testing by testing dozens, or even hundreds of scenarios at one time. For example, you can upload a .csv file of test scenarios you’ve written in natural language, or you can ask Test Suites (Beta) to use AI to generate test input that is relevant to the jobs your agent performs.

When a batch test is run, the results show you the input that was tested along with the expected and actual subagents and actions it called, the expected response, and whether each input passed or failed. If you need more information about why a test input failed, you can copy and paste the input into the Agentforce Builder Preview panel, and review the path the agent took to reach the failed response on the plan canvas. This helps you further refine your instructions, which in turn improves the user experience. For detailed information about Test Suites (Beta) and writing or generating test scenarios, see Agentforce: Agent Testing.

Agent Testing Considerations
In traditional application testing, you plan every detail of your application before you even begin to build it. Success is measured by producing predictable and repeatable results–it’s deterministic. Your solution either works the way it’s intended, or it doesn’t. On the other hand, while developing an agent also requires planning up front, you refine, test, and revise your agent while you build it. Agent testing is probabilistic, meaning its results can be less predictable, unique, and, well, sometimes surprising because of generative AI’s lack of rules-based logic. The same input can generate many different, yet still correct responses, some incorrect responses, or occasionally, even hallucinations. It’s also difficult to anticipate all the ways a user might interact with your agent, so you need to account for and test for a variety of scenarios when you build it. This way, you minimize ‌responses that don’t match your user’s input or that are inaccurate.

Determine When Your Agent Is Production-Ready
The probabilistic nature of agent behavior makes determining when your agent is production-ready a little unclear. Every company needs to determine its own baseline for pass/fail rates in various scenarios. There isn’t one right answer, and the level of precision desired can vary by industry. A good place to start is to consider how accurately a human would perform the same task, for example, handling reservation questions, and use that as a baseline. Then you can strive to ensure your agent meets or exceeds that level of accuracy.

Always Test in a Sandbox
Testing your agents can modify your CRM data, so always use Test Suites (Beta) in a sandbox environment, never in your production environment.

Use Multiple Criteria to Evaluate Your Response
To get the responses you want from your inputs in the Preview panel, it will likely take some trial and error. Building an agent is an iterative process. And to account for various types of input, you need to go through a bit of revising, including wordsmithing, checking permissions, validating data, or adding more details or guardrails to your instructions. The feedback you receive on the plan canvas, event logs, or Test Suites (Beta) will help you hone in and identify where you need to refine your agent's subagents, actions, or instructions to get responses that are closer to your desired level of accuracy.

Here are several key things to consider as you test your agent and ways to address them.

Testing Consideration

Ways to Refine Your Agent

Did the agent follow my instructions?

Refine the wording in your existing instructions, or add instructions to cover different types of input.
Is the response accurate, complete, and easy to read?

Check that the agent is accessing the correct data.
Break actions or instructions into smaller pieces that can be addressed separately.
Refine the wording in your instructions to align with your company’s voice.
Is the response grounded in my data?

Revise instructions to call the desired data.
Verify the agent has the permissions needed to access all required data.
Ensure the data it’s accessing is current and accurate.
Is the response aligned with my brand voice?

Refine instructions to use terms or phrasing that your business uses.
Adjust the tone in the language settings tab.
How long did the response take?

Clarify instructions.
Break actions or instructions into smaller pieces.
Is there bias or toxicity in the response?

Refine or add guardrails to your instructions.
Is the response reliable every time?

Determine if the agents responses meet or exceed your baseline for accuracy.
Testing Costs
One last testing consideration is the cost to run tests. Testing your agent in Test Suites (Beta) can consume requests or credits. These requests and credits are billable usage metrics for generative AI that incur costs to your organization. To learn more, review the Generative AI Billable Usage Types help documentation, or speak with your account executive.

Wrap Up
Agent Testing requires a different way of thinking and working from traditional application testing. When you consider all of the variables that can impact your agent’s responses, it’s no wonder that successful agent testing is more subjective than a traditional software test. Mastering Agentforce testing tools and understanding how to mitigate the factors that affect the agent’s performance can help you quickly achieve your desired level of accuracy. In the next unit, you learn the importance of creating an agent testing strategy to guide your testing.

Resources
Trailhead: Agentforce Builder Basics
Blog: Is Your Agent Production Ready?
Salesforce Help: Agentforce Session Tracing
Salesforce Help: Evaluate the Quality of a Response
Salesforce Help: Generative AI Billable Usage Types
Quiz
To complete this unit, you need to answer all the quiz questions correctly.
+100 Points

1
Why is agent testing considered “probabilistic” and less predictable compared to traditional application testing?

A
Because agents strictly follow rules-based logic, ensuring consistent outcomes.

B
Because the testing tools in Agentforce Builder are designed for deterministic results.

C
Because generative AI lacks rules-based logic, leading to varied and sometimes surprising responses.

D
Because developers intentionally introduce randomness into agent behavior.

2
Where in Agentforce Builder can you see the path your agent took through the subagents, actions, and instructions to generate a response?

A
Settings

B
Subagents

C
The plan canvas

D
Conversation Preview
