import * as vscode from 'vscode';
import { C4GroupProvider } from './services/C4GroupProvider';
import { ScenarioRunner } from './services/ScenarioRunner';
import { TemplateCreator } from './services/TemplateCreator';
import { TemplateSelection } from './services/TemplateSelection';

export function activate(context: vscode.ExtensionContext) {
	const outputChannel = vscode.window.createOutputChannel('OpenClonk');
	const provider = new C4GroupProvider(outputChannel);
	const runScenarioProvider = new ScenarioRunner();
	const templateCreator = new TemplateCreator();
	const templateSelection = new TemplateSelection();

	context.subscriptions.push(vscode.commands.registerCommand('oc-ext.unpackC4g', ({ fsPath }) => {
		provider.unpack(fsPath)
			.then(_ => vscode.commands.executeCommand("workbench.files.action.refreshFilesExplorer"));
	}));

	context.subscriptions.push(vscode.commands.registerCommand('oc-ext.packC4g', ({ fsPath, ...args }) => {
		provider.pack(fsPath)
			.then(_ => vscode.commands.executeCommand("workbench.files.action.refreshFilesExplorer"));
	}));

	context.subscriptions.push(vscode.commands.registerCommand('oc-ext.runScenarioInEditor', ({ fsPath }) => {
		runScenarioProvider.run(fsPath, outputChannel);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('oc-ext.createScenario', async ({ fsPath }) => {
		const result = await templateSelection.select();
		
		if (result) {
			await templateCreator.createFromTemplate(result.templateDef, context.extensionPath, result.itemName, fsPath);
			vscode.commands.executeCommand("workbench.files.action.refreshFilesExplorer");
		}
	}));
}

export function deactivate() { }