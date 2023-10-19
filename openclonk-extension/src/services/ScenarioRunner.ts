import { spawn } from 'child_process';
import { exists } from 'fs';
import * as path from 'path';
import { OutputChannel, window, workspace } from "vscode";

export class ScenarioRunner {
    public run(pathToScenario: string, outputChannel: OutputChannel) {
        const pathToExecutable = this.getPathToGameExecutable();

        if (!pathToExecutable) {
            window.showInformationMessage('Path to OpenClonk executable is not set. Please update your settings.');
            return;
        }

        this.execute([`${pathToScenario}`], outputChannel);
    }

    private execute(args: string[], outputChannel: OutputChannel) {
        const pathToExecutable = this.getPathToGameExecutable();
        
        if (!pathToExecutable) {
            window.showInformationMessage('Path to OpenClonk executable is not set. Please update your settings.');
            return;
        }
        
        const executableName = path.basename(pathToExecutable);
        const cwd = pathToExecutable.substr(0, pathToExecutable.length - executableName.length);

        const cprocess = spawn(executableName, args, { cwd });

        cprocess.stdout.on('data', function (data) {
            outputChannel.append(data.toString());
        });

        cprocess.stderr.on('data', function (data) {
            outputChannel.append(data.toString());
        });

        // cprocess.on('exit', function (code) {
        //     outputChannel.appendLine(`Process exited with code ${code == null ? "null" : code.toString()}`);
        // });

        cprocess.on('error', (err) => {
            this.provideDiagnostics(err, [pathToExecutable, ...args].join(" "));
        });
    }

    private provideDiagnostics(err: Error, cmdString: string) {
        const pathToExecutable = this.getPathToGameExecutable() as string;

        exists(pathToExecutable, (doesExist) => {
            if (doesExist) {
                // vscode.window.showErrorMessage('Failed to invoke OpenClonk executable.');
                console.log(`Calling Game-Executable by: ${cmdString}`);
                console.error(err);
            }
            else {
                window.showErrorMessage(`OpenClonk executable could not be found at: "${pathToExecutable}". Please check your settings.`);
            }
        });
    }

    private getPathToGameExecutable() {
        return workspace.getConfiguration("oc-ext").get<string>("pathToGameExecutable");
    }
}