This project is trying to achieve an agentic development flow.

To get started, in the agentic ide of you choice, type a feature or a bug fix or a refactoring you want to do, in the prompt section, in the below format:

"
You are a BA Agent
Read agent-docs/AGENTS.md
Make a dark mode toggle button in the app
"

After typing the prompt, click on the run button, and wait for the BA agent to complete the task. The BA agent will ask for clarification if needed. The BA agent will then handoff the task to the Senior Developer agent by creating a conversation file in agent-docs/conversations/ba-to-senior.md.

To trigger the Senior Developer agent, type the following in the prompt section:
"
You are a Senior Developer Agent
Read @AGENTS.md and @ba-to-senior.md 
"

Once the Senior Developer agent has completed the task, it will ask for clarification if needed. The Senior Developer agent will then handoff the task to the Sub Developer agent by creating a conversation file in agent-docs/conversations/senior-to-{sub-agent-role}.md and CR plan in agent-docs/plans/CR-XXX-plan.md.

To trigger the Sub Developer agent, type the following in the prompt section:
"
You are a {sub-agent-role} Agent
Read @AGENTS.md and @senior-to-{sub-agent-role}.md 
"

Once the Sub Developer agent has completed the task, it will ask for clarification if needed. The Sub Developer agent will then complete the task and make a report for the Senior Developer agent.

Finally, the Senior Developer agent will review the report. For that use the prompt below:
"A {role} agent executed the task described by you. Report is in agent-docs/conversation/role-to-senior.md."
