# Welcome

Hi, welcome to LLM Journey, this, as the name of the folder suggests is documentation for humans.

To know more about the project you can read the main [README](/README.md). This file documents the agentic flow you can use to develop various features in this project. The agent documentation is not Project Agnostic yet, so this flow may not necessary work in other projects just my moving the agent docs folder.

If you want to know about exploration and discoveries I am making while builing this project, you can go to the [My Journey Doc](/human-docs/my-journey.md)

# Agentic Development Flow
**Note: Some models are better at following the docs than others, try out different models and see what works the best for you.**

To get started with the flow, in the agentic tool of your choice, trigger the BA agent context collection using the following prompt:

"
You are a BA Agent.
Read agent-docs/AGENTS.md
"

After the context is collected and Agent assumes the role of the BA, prompt the agent to introducer a feature or a refactor you want to perform:

"Make a dark mode toggle button in the app"

The BA agent will analyze the requirement and can ask for clarification if needed. The BA agent will then create a handoff and a CR for the Tech Lead agent, creating a conversation file in agent-docs/conversations/ba-to-tech-lead.md.

After the creation of the CR and handoff we can start planning via Tech Lead role. In a new agent session trigger the Tech Lead context collection using similar prompt as the one used for BA. After context collection ask the agent to proceed with the BA handoff in the conversations folder.

The Tech Lead will create a CR plan and after approval will create handoffs for the sub agents (Frontend, Backend, etc) depending on the task at hand.

The pattern described above is followed for the subagents that perform the task, for triggering review in the tech lead session according to the sub agent handoffs and for the CR closure in the existing BA session according to the tech lead handoff.

# Feedback / Meta Analysis

In order to improve the agent docs a feedback or meta analysis session is carried out as defined in the [Meta Improvement Guide for Agents](/agent-docs/coordination/meta-improvement-protocol.md). We essentially backpropogate through the workflow asking agents for feedback and suggestions to imporve the agent docs.

An agent then process the set of suggestion and lists down a final set of changes to be made to the agents docs. After a review of the changes, the agent can be prompted to make that appropriate edits to the agent for better agent operation next session.

# Issues

Agent docs aims to create documentation that agents can easily access to gather appropriate context depending on the task at hand. It attempts to have a modularized representation of the project so that non overlaping responsibilities can be assigned to different agents. There are a few issues that pop up while trying to achieve this which are noted below:

## Context consumption

After meta analysis, agent docs are refined for better workflow adherence, but there is no upper limit set that limits addition to the markdowns. The agent docs now consumes 30k to 50k of the context window per role. 

## Meta analysis "improvements"

No concrete metric to measure whether agent docs are being approved or not.