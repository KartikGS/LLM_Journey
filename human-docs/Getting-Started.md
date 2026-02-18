# Welcome

Hi, welcome to LLM Journey, this, as the name of the folder suggests is documentation for humans, written by a human (atleast some of it). It feels weird writing anything on my own, calming for some reason. Although, this folder will also probably be parsed through some LLM (I will try my best to resist the temptation).

To know more about the project you can read the main [README](/README.md). This file documents the agentic flow you can use to develop various features in this project. The agent documentation is not Project Agnostic so this flow may not necessary work in other project yet.

If you want to know about exploration and discoveries I made while builing this project, you can go to the [My Journey Doc](/human-docs/my-journey.md)

# Agentic Development Flow
**Note: Some models are better at following the docs than others, try out different models and see what works the best for you.**

To get started with the flow, in the agentic IDE of you choice, trigger the BA agent context collection using the following prompt:

"
You are a BA Agent
Read agent-docs/AGENTS.md
"

After the context is collected and Agent assumes the role of the BA, prompt the agent to introducer a feature or a refactor you want to perform:

"Make a dark mode toggle button in the app"

The BA agent will analyze the requirement and can ask for clarification if needed. The BA agent will then create a handoff and a CR for the Tech Lead agent, creating a conversation file in agent-docs/conversations/ba-to-tech-lead.md.

After the creation of the CR and handoff we can start planning via Tech Lead role. In a new agent session trigger the Tech Lead context collection using similar prompt as the one used for BA. After context collection ask the agent to proceed with the BA handoff in the conversations folder.

The Tech Lead will create a CR plan and after approval will create handoffs for the sub agents (Frontend, Backend, etc) depending on the task at hand.

The pattern described above is followed for the subagents that perform the task, triggering review in the tech lead session according to the sub agent handoffs and for the CR closure in the existing BA session according to the tech lead handoff.

# Feedback / Meta Analysis

In order to improve the agent docs a feedback or meta analysis session is carried out, where the agents are given the following prompt:

"

Thanks for playing the role of the {role} Agent. Good job on perfoming the complete CR flow. Now, I would like to perform a feedback or a meta analysis session with the goal of improving the agent docs, so that the next agent playing the {role} role can do a better job.

Here are a few questions to consider:

Did you find any conflicting instructions in the agent docs which can cause confusion?

Did you find any redundant information in the agent docs, things that are repeated twice that don't need to be?

Did you find any information to be missing from the agent docs, if present, would have made certain decisions easier?

Do you find sections in the agents docs where instructions were unclear?

Do you think responsibilities handed to your role are inconsistent? Should there be another role added to improve the separation of concern?

Do you think this project has ambiguous or conflicting development/engineering philosophy?

What are some things you noticed that may not be questioned above? 

Where do you think the documents should be improved so that the {role} agent can perform its task effectively?

"

after which the agent suggest changes to be made to the agents docs. After a review of the changes suggested, agents can be prompted to make that appropriate edits to the agent for better agent operation next session.

