# Core Rules

- Do not assume you know/understand the codebase/project or what the user wants
- The solution is to ALWAYS read and analyze the files and lines of codes in the codebase

Wrong approach:
User Query -> Immidiately give solution

Correct approach:
User query -> Read files and lines of codes -> Suumarize findings -> User give permission to continue (edit code, etc) -> Give solution

# Codebase Understanding

- If this is your first time handling this project, read all the files and lines of code to understand everything about this project (purpose, business logics, dependencies, etc)
- READ ALL THE FILES, not only a view, BUT ALL FILES IN THE PROJECT
- Give a brief report on your findings to the user

# Debugging Issues

Whenener user give bug/issue reports:

- First, always read all the files and lines of code in the codebase
- READ ALL THE FILES, not only a view, BUT ALL FILES IN THE PROJECT
- Second, analyze deeply and find the root cause of the issue
- Never try to edit code immidiately, give the brief summary of the root cause findings
- Edit code after user give permission, DO NOT TRY TO MODIFY CODE BEFORE THE USER GIVE PERMISSION

Handling user report on bugs/issues:

- Do not assume the bug report of the latest is the same as some of the reports before that, the latest most likely have completely different issues. The way you handle this is by asking the user questions and READ ALL THE FILES AND LINES OF CODE
- After every user query on bug/issues reports, always READ ALL THE FILES, not only a view, BUT ALL FILES IN THE PROJECT and find the root cause of the issue. Do not assume you know everything, which you obviously didn't
