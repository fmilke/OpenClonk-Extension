import * as vscode from 'vscode';
import { exec } from 'child_process';
import { exists } from 'fs';
import * as path from 'path';
import { CONFIG_NAME, configKeys } from "../configuration";

export class C4GroupProvider  {
    public static ARG_EXPLODE = "-x";
    public static ARG_PACK = "-p";

    constructor(
        private readonly output: vscode.OutputChannel,
    ) {}

    public unpack(pathToFolder: string): Thenable<void> {
        this.output.appendLine(`Unpacking: ${pathToFolder}`);
        if (this.canExecute()) {
            return this.execute([`"${pathToFolder}"`, C4GroupProvider.ARG_EXPLODE]);
        } else {
            this.output.appendLine('Cannot unpack. C4group setting not set.');
            return Promise.resolve();
        }
    }

    public pack(pathToFolder: string): Thenable<void> {
        this.output.appendLine(`Packing: ${pathToFolder}`);
        if (this.canExecute()) {
            return this.execute([`"${pathToFolder}"`, C4GroupProvider.ARG_PACK]);
        } else {
            this.output.appendLine('Cannot pack. C4group setting not set.');
            return Promise.resolve();
        }
    }

    private canExecute() {
        return true;
    }

    private getPathToExecutable() {
        return vscode.workspace.getConfiguration(CONFIG_NAME).get<string>(configKeys.pathToC4gExecutable);
    }

    private execute(args: string[]): Promise<void> {
        const pathToExecutable = this.getPathToExecutable();

        if (!pathToExecutable) {
            vscode.window.showInformationMessage('Path to C4Group-Executable is not set. Please update your settings.');
            return Promise.resolve();
        }

        const executableName = path.basename(pathToExecutable);
        const cwd = pathToExecutable.substr(0, pathToExecutable.length - executableName.length);

        const cmdString = [executableName, ...args].join(" ");

        return new Promise<void>((resolve) => {
            exec(cmdString, { cwd }, (error, _stdout, _stderr) => {
                if (error) {
                    this.pathForExecutableExists().then(executableExists => {
                        if (executableExists) {
                            vscode.window.showErrorMessage('Failed to invoke C4Group-Executable.');
                        }
                        else {
                            vscode.window.showErrorMessage(`C4Group-Executable could not be found at: "${pathToExecutable}". Please check your settings.`);
                        }

                        resolve();
                    });
                } else if (this.loggedKeyError(_stdout)) {
                    vscode.window.showErrorMessage('Failed to invoke C4Group-Executable. No key file found.');
                } else {
                    resolve();
                }
            });
        });
    }

    private loggedKeyError(stdout: string): boolean {
        return stdout.includes("No valid key file found.");
    }

    private pathForExecutableExists(): Thenable<boolean> {
        this.output.appendLine("Checking for executable");
        const pathToExecutable = this.getPathToExecutable();

        if (!pathToExecutable) {
            return Promise.resolve(false);
        }

        return new Promise((resolve) => {
            exists(pathToExecutable, (doesExist) => {
                this.output.appendLine("Exists: " + doesExist);
                console.log(doesExist);
                resolve(doesExist);
            });
        });
    }
}