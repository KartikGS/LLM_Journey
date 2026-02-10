# Welcome

Hi, welcome to LLM Journey, this, as the name of the folder suggests is documentation for humans, written by a human (atleast some of it). It feels wierd writing anything on my own, calming for some reason. Although, this folder will also probably be parsed through some LLM (I will try my best to resist the temptation).

This file documents the agentic flow you can use to develop various features in this project. The agent documentation is not Project Agnostic so this flow may not necessary work in other project yet.

If you want to know about exploration and discoveries I made while builing this project, you can go to the [My Journey Doc](/human-docs/my-journey.md)

# Agentic Development Flow
**Note: Some models are better at following the docs than others, try out different models and see what works the best for you. I would recommend using Opus 4.5**

To get started, in the agentic tool of you choice, type a feature or a bug fix or a refactoring you want to do, in the prompt section, in the below format:

"
You are a BA Agent
Read agent-docs/AGENTS.md
Make a dark mode toggle button in the app
"

Wait for the BA agent to complete the task. The BA agent will ask for clarification if needed. The BA agent will then create a handoff and a CR for the Tech Lead agent, creating a conversation file in agent-docs/conversations/ba-to-senior.md.

To trigger the Tech Lead agent, in a new tab enter the following prompt:
"
You are a Tech Lead Agent
Read @AGENTS.md and @ba-to-senior.md 
"

Once the Tech Lead agent has completed the task, it will ask for clarification if needed. The Tech Lead agent will then handoff the task to the Sub Agent by creating a conversation file in agent-docs/conversations/senior-to-{sub-agent-role}.md and CR plan in agent-docs/plans/CR-XXX-plan.md.

To trigger the Sub agent, type the following in the prompt section:
"
You are a {sub-agent-role} Agent
Read @AGENTS.md and @senior-to-{sub-agent-role}.md 
"

Once the Sub agent has completed the task, it will ask for clarification if needed. The Sub agent will then complete the task and make a report for the Tech Lead agent.

The Tech Lead agent will review the report. For that use the prompt below:
"A {role} agent executed the task described by you. Report is in agent-docs/conversation/role-to-senior.md."

The Tech Lead will this generate the report which should be reviewed in the BA agent window using the below prompt
"
Read @senior-to-ba.md
"
The BA agent will then close the CR