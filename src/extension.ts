import * as vscode from 'vscode';
import * as fs from 'fs'
import * as path from 'path'
import axios from 'axios'

class PomodoroTimer {
	private timeRemaining: number;
	private isRunning: boolean;
	private intervalId: NodeJS.Timeout | undefined;
	private statusBar: vscode.StatusBarItem;
	private isPaused: boolean;
  
	constructor() {
	  this.timeRemaining = 25 * 60;
	  this.isRunning = false;
	  this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	  this.statusBar.command = 'bron.togglePomodoro';
	  this.statusBar.text = `$(debug-start) 🍅 Start Pomodoro`;
	  this.statusBar.show();
	  this.isPaused = false;
	}
  
	startTimer() {
	  if (this.isRunning) {
		return;
	  }
	  this.isRunning = true;
	  this.intervalId = setInterval(() => this.updateTimer(), 1000);
	  this.updateTimer(); 
	  this.statusBar.text = `$(debug-stop) 🍅 Pomodoro: ${this.formatTime(this.timeRemaining)}`;
	  this.isPaused = false;
	}
  
	pauseTimer() {
	  if (this.intervalId) {
		clearInterval(this.intervalId);
		this.intervalId = undefined;
	  }
	  this.isRunning = false;
	  this.isPaused = true;
	  this.statusBar.text = `$(debug-pause) 🍅 Pomodoro paused: ${this.formatTime(this.timeRemaining)}`;
	}
  
	stopTimer() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = undefined;
		}
		this.isRunning = false;
		this.isPaused = false;
		this.timeRemaining = 25 * 60;
		this.statusBar.text = `$(debug-start) 🍅 Start Pomodoro`;
	}
  
	toggleTimer() {
		if (this.isRunning) {
			this.pauseTimer();
		} else if (this.isPaused) {
			this.startTimer();
		} else {
			this.startTimer();
		}
	}
  
  
	private updateTimer() {
		if (this.timeRemaining <= 0) {
			this.stopTimer();
			vscode.window.showInformationMessage('Pomodoro session finished, congratulations!');
			this.statusBar.text = `$(debug-start) 🍅 Restart Pomodoro`;
			this.timeRemaining = 25 * 60;
		} else {
			this.timeRemaining--;
			this.statusBar.text = `$(debug-stop) 🍅 Pomodoro: ${this.formatTime(this.timeRemaining)}`;
		}
	}
  
	private formatTime(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const remSeconds = seconds % 60;
		return `${minutes}:${remSeconds < 10 ? '0' : ''}${remSeconds}`;
	}
  
	public dispose() {
		this.statusBar.dispose();
	} 
}

export function activate(context: vscode.ExtensionContext) {
    let pomodoroTimer: PomodoroTimer | undefined = undefined;
    let configure: vscode.StatusBarItem | undefined = undefined;

    let activateCommand = vscode.commands.registerCommand('bron.activate', () => {
        if (!pomodoroTimer) {
            pomodoroTimer = new PomodoroTimer();
        }

        if (!configure) {
            configure = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
            configure.text = '$(gear) Configure';
            configure.command = 'bron.configureProject';
            configure.show();
            context.subscriptions.push(configure);
        }
    });

    let toggleCommand = vscode.commands.registerCommand('bron.togglePomodoro', () => {
        if (pomodoroTimer) {
            pomodoroTimer.toggleTimer();
        }
    });

    let disposable = vscode.commands.registerCommand('bron.configureProject', async () => {
        const chosenOption = await vscode.window.showQuickPick(['Configure React Project', 
																'Configure Django Project', 
																'Configure Angular Project', 
																'Configure Flutter Project',
																'Configure MongoDB Project',
																'Configure MySQL Project',
																'Configure RubyOnRails Project',
																'Configure SQL Project',
																'Configure SpringBoot Project'], 
																{ placeHolder: 'Choose a project type to configure' });
	
															
        if (chosenOption) {
            const markdownContent = await generateMarkdown(chosenOption);
            createMarkdownFile(markdownContent);
        }
    });
	
	let GPT = vscode.commands.registerCommand('bron.analyzeCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
			const selection = editor.selection;
			const selectedText = editor.document.getText(selection);
			if (selectedText) {
				const analysis = await getGPTAnalysis(selectedText);
				createMarkdownFile(analysis);
			} else {
				vscode.window.showInformationMessage('No code selected for analysis.');
			}
        }
	});
      
    
	context.subscriptions.push(GPT);
    context.subscriptions.push(disposable);
    context.subscriptions.push(activateCommand);
    context.subscriptions.push(toggleCommand);
}

async function generateMarkdown(projectType: string): Promise<string> {
    let content = '';
    let fileName = `${projectType.split(' ')[1].replace(/\s/g, '_')}`;

	const response = await axios.get(`https://raw.githubusercontent.com/UditKarth/bronmdfiles/main/${fileName}.md`);
	content = response.data;

    return content;
}

async function getGPTAnalysis(code: string): Promise<string> {
    const apiKey = process.env.OPENAPI_KEY;
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
		model: "gpt-3.5-turbo",
		messages: [
			{ 
				role: "system", 
				content: "Analyze the following code. Generate a markdown file, which has analysis of the code, and tells me if there are points I should improve on (example - time complexity, space, etc). Try to be brief." 
			},
			{ 
				role: "user", 
				content: code 
			}
		],
		temperature: 0.7
    }, {
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${apiKey}`,
		},
    });

    const message = response.data.choices[0].message.content;
    return message;
}

function createMarkdownFile(content: string) {
    const workspaceF = vscode.workspace.workspaceFolders;

    if (!workspaceF || workspaceF.length == 0) {
        vscode.window.showErrorMessage('No workspace opened.');
        return;
    }

    const workspacePath = workspaceF[0].uri.fsPath;
    const filePath = path.join(workspacePath, 'project_configuration.md');

    fs.writeFile(filePath, content, (err) => {
        if (err) {
            vscode.window.showErrorMessage('Failed to create markdown file');
            console.error(err);
        } else {
            // vscode.window.showInformationMessage('Markdown file created successfully.');
            // vscode.workspace.openTextDocument(filePath).then(doc => {
            //     vscode.window.showTextDocument(doc);
            // });
        }
    });

	vscode.commands.executeCommand("workbench.action.closeActiveEditor");
	vscode.commands.executeCommand("markdown.showPreview", vscode.Uri.file(filePath));
	
}

export function deactivate() {}