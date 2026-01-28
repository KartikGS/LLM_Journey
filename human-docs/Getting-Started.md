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