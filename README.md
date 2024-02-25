# bron-md README

Empower your development workflow with our all-in-one toolkit, featuring seamless Git Note management, integrated Pomodoro timers, and specialized guides for hackers.

## Setup

Open the command palette (`Cmd + Shift + P`) and run the command "Activate bron". Now you are set to use all the features!

## Features

### Pomodoro Timer

### Project Configuration (React, Django, Angular, Flutter, MongoDB, MySQL, RubyOnRails, SQL, SpringBoot)

### Intelligent Code Analysis 

### Git-based Text Edit

## Usage

### Pomodoro Timer
Use on the Pomodoro icon in the status bar / use the command palette

### Project Configuration
Click on the "Configure" icon in the status bar and select the desired project type to configure.

### Code Analysis
Select the code you want to analyze. Use the command palette, and type in "Analyze Code" to trigger code analysis.

### Git-based Text Edit
Open terminal, type `open ~/.zshrc`
Now paste the following onto this:
```
function chpwd {
    open_task_list_for_branch
}
export OPENAI_API_KEY=<your secret API key>
open_task_list_for_branch() {
  if git rev-parse --git-dir > /dev/null 2>&1; then
    local branch_name=$(git rev-parse --abbrev-ref HEAD)
    local tasklist="./${branch_name}_tasklist.txt"
    if [[ ! -f "$tasklist" ]]; then
	touch "$tasklist"
	echo "Task List for Branch: $branch_name" > "$tasklist"
	echo "Date: $(date "+%Y-%m-%d")" >> "$tasklist"
	echo "---------------------" >> "$tasklist"
	echo "Priority Tasks:" >> "$tasklist"
	echo "- [ ] 
	echo "- [ ]
 	echo "- [ ] 
 	echo "---------------------" >> "$tasklist"
 	echo "Secondary Tasks:" >> "$tasklist"
 	echo "- [ ] 
	echo "- [ ] 
	echo "- [ ] 
 	echo "---------------------" >> "$tasklist"
	echo "Notes:" >> "$tasklist"
	echo "- 
	echo "- 
 	echo "---------------------" >> "$tasklist"
 	echo "Completed Tasks:" >> "$tasklist"
	echo "- 
	echo "-
    fi
    echo "Opening task list"
    open -a TextEdit "$tasklist"
  else
    echo "Not in a git repository"
  fi
}
```

## Installation
Launch Visual Studio Code.
Go to Extensions (`Cmd+Shift+X`).
Search for "bron-md" and install the extension.

