Improve Prompts Using Different Prompt Techniques
Learning Objectives
After completing this unit, you’ll be able to:

Enhance prompts with relevant context that improves artificial intelligence (AI) output.
Guide an AI agent through reasoning steps that help it problem-solve accurately.
Outline the steps in the lifecycle of a prompt.
When working alongside agents, one of the most important skills for any professional is prompt engineering. While agents and the large language models (LLMs) they’re built on are designed to respond to the cues and style of natural human speech, there’s skill involved in optimizing your responses for better results. Knowing how to use more advanced prompt engineering strategies can help you level up from single applications of AI to business-scale solutions that evolve to fit your needs.


Zero-Shot Prompts
Powering up your prompts is easier than it sounds. But first, you have to know what kind of prompt to use. Zero-shot prompts, also known as direct prompts, are probably the first thing most people think of when they sit down to use AI for the first time. They involve giving a model direct instructions with no additional context or examples. This can be useful for things like generating new ideas for creative projects or summarizing a website—tasks where you won’t necessarily need a lot of additional framing to get a reliable output.

Here are some examples of zero-shot prompts.

Summarize this meeting transcript, and make a list of action steps for each participant.
Create a block of code that sends a push notification when a website is updated.
But when it comes to specific and actionable tasks, zero-shot prompts can give the model too wide a framework for producing helpful results. You can help AI help you by using techniques like few-shot, chain-of-thought, and role-based prompting.

Few-Shot Prompts
Few-shot prompting is a technique in which you give the AI a few examples of the task you want it to complete. By showing the AI examples in your prompt, it learns the pattern and produces a relevant result.

This is especially useful when working with Salesforce records, automated email drafts, case summaries, or custom flows where structure and style matter.

When to Use It
Use few-shot prompting when:

You need specific output formatting.
You want the AI to mimic a particular tone, structure, or style.
The task is complex or domain-specific, like summarizing a customer support case in your company’s voice.
An Example: Few-Shot Prompting in Salesforce Support Use Case
Imagine you’re building an AI-powered assistant in Salesforce to help agents summarize support cases. You want the assistant to follow a specific format that includes the issue, resolution, and next steps.

Here’s how you’d write a few-shot prompt.

Prompt
You’re a Salesforce support agent. Based on the case information, write a concise summary in this format:

Case: Resolution: Next Steps

Examples

Details

Example 1

Case: Customer reports that the dashboard is not loading on mobile devices.

Resolution: Cleared browser cache and verified dashboard settings for mobile compatibility.

Next Steps: Follow up in 2 days to confirm functionality.

Example 2

Case: User cannot reset password using the self-service portal

Resolution: Reset the user’s password manually and update portal configuration settings.

Next Steps: Monitor for similar issues across other users.

Now summarize this case

Case: Client unable to upload large files (>20MB) through the Experience Cloud site.

Example AI Response (Expected Output)

Resolution: Adjusted the file upload size limits in the site configuration and enabled large file support.

Next Steps: Notify client of the update and verify successful upload by end of week.

Chain-of-thought Prompts
Chain-of-thought (CoT) prompting guides the AI to “think out loud” before delivering an answer. Instead of jumping straight to a response, the model walks through intermediate steps or reasoning, which improves accuracy—especially for multistep or logic-heavy tasks.

This is especially helpful in Salesforce scenarios where reasoning is key, including lead qualification, case routing, and forecasting scenarios.

Here are some opportunities to use chain-of-thought prompting:

You want the AI to explain its reasoning before giving an answer.
You’re completing a task that involves multiple steps, like checking record conditions or evaluating business logic.
You’re debugging an AI response and want transparent thinking.
Example Prompt: Chain-of-Thought Prompting in Lead Qualification
In this example, you’re building a custom GPT (generative pre-trained transformer) action to help sales reps qualify leads based on fields in a Salesforce record. You want the model to think step-by-step before labeling the lead as Hot, Warm, or Cold.

Prompt
You’re an assistant helping a sales rep qualify a lead. Think step-by-step before assigning a status of Hot, Warm, or Cold based on:

Lead Source
Industry
Budget
Purchase Timeline
Examples

Details

Example 1

Lead Source: Referral | Industry: Tech | Budget: $80,000 | Timeline: 1 month

Reasoning: Referral source suggests strong intent. Tech industry often has quick turnaround. The budget is high, and the timeline is short.

Qualification: Hot

Example 2

Lead Source: Web | Industry: Nonprofit | Budget: $5,000 | Timeline: 6 months

Reasoning: Web lead can be cold unless paired with urgency. The budget is low and the timeline is far out.

Qualification: Cold

Now qualify this lead

Lead Source: Event | Industry: Healthcare | Budget: $25,000 | Timeline: 2 months

AI Response (Expected Output):

Reasoning: Event leads indicate interest, especially if attended in person. Healthcare is a stable industry. The budget is moderate and the timeline is reasonable.

Qualification: Warm

Role-Based Prompting
Role-based prompting is a technique where you assign the AI a specific role or persona before asking it to complete a task. This helps the model align its tone, expertise, and decision-making style to that role—just like a Salesforce user would behave in their daily job.

When you clearly define the role, the AI can:

Mimic job-specific language and behavior
Understand the task from that user’s perspective
Produce more relevant, accurate, and human-like output
Role-based prompts are even more powerful when used with dynamic data from your org. Use merge fields like {{Contact.FirstName}}Copy or {{Case.Subject}}Copy to personalize prompts.

Use role-based prompting when:

You want the AI to mirror the tone and decisions of a specific Salesforce persona (for example, Sales Rep, Service Agent, Admin).
You’re working on a task that relies on business context, like customer relationship management best practices, key performance indicators, or workflows.
You’re building AI assistants with custom instructions using Slack, Flow, and Apex integrations.
Example Prompt: Role-Based Prompting in a Sales Context
In this scenario, You’re creating a GPT-powered assistant that helps sales reps draft follow-up emails after a discovery call.

You want the AI to adopt the mindset and tone of a Salesforce account executive.

Prompt
Act as a Salesforce account executive. You’ve just had a discovery call with a prospective customer. Draft a follow-up email that:

Recaps the key pain points
Highlights how Salesforce can help
Includes a CTA for the next meeting
Use a tone that’s professional, confident, and focused on value.

Details from the call:

Customer struggles with disconnected data across sales and service.
They’re using spreadsheets and legacy tools.
Interested in improving cross-team collaboration and visibility.
Example AI Response (Expected Output)

Subject: Next Steps on Connecting Your Sales & Service Teams

Hi [Customer Name],

Great speaking with you earlier! I appreciated learning more about the challenges your team is facing, especially around disconnected systems and the reliance on spreadsheets.

As we discussed, Salesforce Customer 360 can help unify your sales and service data in one platform—giving your teams real-time visibility and making collaboration seamless.

Let’s schedule a follow-up to explore how this could look in your environment. How’s your availability early next week?

Best,

[Your Name]

Account Executive, Salesforce

Conversational Prompts
Sometimes the most powerful prompt doesn’t just give instructions, it creates a conversation. Conversational prompts guide the AI through a dialogue that mirrors how a human Salesforce agent or user might interact with a colleague, customer, or system. This prompt style encourages a more human, contextual, and fluid exchange, which can lead to more nuanced and helpful responses.

Unlike zero-shot or few-shot prompts that give static instructions or examples, conversational prompts shape the AI’s behavior through back-and-forth exchanges. This is especially useful when building AI-powered flows in Agentforce that are meant to sound interactive, provide progressive guidance, or adapt based on input.

Use conversational prompting when:

You want the AI to behave like a thoughtful collaborator, not just a tool.
You're building chat-based flows for Slack, bots, or guided experiences.
You want dynamic, multi-turn interactions where the AI responds based on evolving input.
You’re simulating or replacing internal Q&A, training, or coaching conversations.
Example Prompt:
Imagine you're building a flow to guide a new Salesforce admin through their first org setup. Instead of delivering all the info at once, the AI guides the user step-by-step—asking questions, offering options, and making the experience feel more like a real-time onboarding session.

Prompt:

You’re a helpful Salesforce onboarding assistant. Ask clarifying questions, walk the user through setup tasks step-by-step, and offer suggestions when needed. Make the experience feel like a live conversation.

AI Output Example (Expected Output):

Hi there! Welcome to Salesforce! I’m here to help you get your org set up.

First things first: are you planning to use Salesforce mainly for Sales, Service, or both?

(Once user responds: “Sales”)

Great! Let’s start by setting up your lead and opportunity stages. Do you already have a defined sales process, or would you like to use Salesforce’s default pipeline to begin with?

Counterfactual Prompts
Counterfactual prompts ask the AI to reason through alternate realities—what would have happened if things were different? This technique is useful when you want the model to evaluate scenarios, explain outcomes, or suggest improvements by imagining hypothetical changes.

In Salesforce, this can be a powerful way to guide decision-making, troubleshoot failed processes, or simulate the impact of business changes. It’s also a great method for coaching, retrospective analysis, and scenario planning.

Use counterfactual prompting when:

You’re troubleshooting why a record, deal, or campaign didn’t perform as expected.
You want the AI to suggest optimizations based on what could have happened.
You’re coaching users or analyzing historical cases to improve future outcomes.
You’re building simulations to help teams explore potential strategies or risks.
Example Prompt:
Let’s say you're building an AI-powered assistant that helps sales managers coach their reps. You want the AI to analyze lost deals and suggest how the outcome might have changed if key factors were different.

Prompt:


You’re a sales coach analyzing lost opportunities. Based on the opportunity data, explain why the deal was lost—and then offer a counterfactual scenario: what could have changed to win the deal?

Input Details:


Opportunity: Lost

Deal Size: $45,000

Close Date: Missed by 2 weeks

Decision Maker: Not involved

Competitor: BigDigital

Primary Objection: Platform felt too complex

Rep Notes: Demo focused heavily on features, not outcomes

Example AI Response (Expected Output):


The deal was lost primarily because the decision maker wasn’t engaged during the buying process, and the demo emphasized features rather than outcomes—making the product seem complex and less accessible.

Counterfactual:


If the decision maker had been involved earlier—and the demo had focused on business impact rather than product depth—the customer might have seen more value and alignment. A simplified, outcome-focused presentation could have improved buy-in and potentially secured the deal.

Creative Prompts
Creative prompts help an AI generate original, imaginative, or stylistically engaging content. Whether you're brainstorming campaign names, drafting event themes, or writing attention-grabbing subject lines, creative prompts let the AI lean into its generative strengths.

In Salesforce, creative prompting shines in use cases like marketing, brand development, internal communications, and experience design – anywhere a touch of originality can elevate impact.

Use creative prompting when:

You need fresh ideas (names, slogans, headlines, or concepts).
You’re crafting content that has a tone, theme, or brand personality.
You want variety and inspiration to get past the blank page.
You’re supporting teams like marketing, enablement, or communications.
Example:

You’re building an AI assistant to help marketers brainstorm names for an upcoming Salesforce campaign focused on customer loyalty and long-term relationships. You want the AI to generate thoughtful, branded ideas that align with the tone of Salesforce.

Example Prompt
Act as a creative marketer at Salesforce. Generate 5 name ideas for a customer loyalty campaign that emphasizes connection, trust, and long-term partnership. Make them engaging, brand-aligned, and suitable for use in digital and event marketing.

Example AI Response (Expected Output):

Forever Forward
Trailblazer Together
Built to Last
Trusted by Design
Momentum Matters
Prompt Lifecycles
Because prompts appear as natural language, it can be easy to think of them as simple writing or language tasks. And while a better grasp on language can help you prompt, it won’t always help you refine your results. That’s because prompting is more involved and requires a mindset that understands the underlying rules of how the system works, not just the output. Taking soccer as an example, it’s the difference between kicking a ball well and knowing how to read the field, set up the play, and control the tempo of the match. It requires a mindset that understands the rules of the game, not just when someone scores.

Similar to software development or product management processes, prompts have lifecycles that make or break their value to the long-term function of a business.

The prompt lifecycle corresponding to the descriptions that follow.

For any prompt that you might want to reuse, keep the following in mind.

Develop: Plan and create prompts based on business needs using things like Prompt Builder, Prompt Templates, model APIs, and platform tools.
Test: See how the prompts you’ve built work when you run them and compare your results to your intended goal.
Monitor: Once you’re confident that a prompt is ready for use, rely on security and analytics from sources like Data 360 AI reporting and the Einstein Trust Layer to get a complete view of how your prompts impact your business.
Iterate: As you learn from the previous steps, make adjustments to improve performance and accuracy. Prompt templates let you create new versions based on feedback data and save you the work of recreating complex prompts each time you want to alter or add a function.
Prompting Best Practices
In addition to a prompt’s normal lifecycle, there are some best practices that can set you up for success as you grow more familiar with advanced applications of agentic AI.

Divide use cases into tasks. As much as possible, try to examine your use case for opportunities to chunk tasks off into more manageable sub-tasks. The better you are at breaking down complex operations into smaller prompts, the easier it is to find parts to improve, which helps you increase value for your big picture.

Define your inputs. LLMs are context machines. The more context they have, the better they function. You can get better results by providing examples of tone, appropriate response length, human-made content that’s similar to the content you want the AI to produce. It also helps to be as specific as possible. For example, asking an AI agent to generate “marketing copy for a resort” is not as helpful as asking it to generate “marketing copy in a humorous tone for a relaxed, family-friendly beach resort in California.”

Depend on what works. As you find prompts that work, dedicate some space to a repository of helpful use cases for that prompt. Not only can this save time for you and future engineers, it can be a great jumping-off point for someone trying to develop a new prompt.

The most important thing to remember about prompts is that you don’t have to reinvent the wheel every time you want to use AI for a task. As your use cases get more advanced, these best practices can help you rise to the challenge and scale efficiently. The best way to test out your advanced prompt engineering skills is to put them into practice.

Continue on to the next unit to get hands-on in Prompt Builder with some of the techniques you’ve learned.

Quiz Scenario
Janina is an inventory manager at a large national retail chain and uses AI to predict stock needs for the upcoming holiday season. She asks the AI to first review last year’s sales data, then analyze this year’s promotions and supply chain delays, and finally project demand by category.