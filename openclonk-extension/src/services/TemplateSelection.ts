import { window, InputBoxOptions } from "vscode";

const templatesConfig: {
    templates: ITemplateDefinition[]
} = {
    templates: [{
        label: "Scenario",
        fsName: "ocs",
        isFolder: true,
        prompt: "Scenario name"
    }, {
        label: "Object",
        fsName: "ocd",
        isFolder: true,
        prompt: "Object name"
    }],
};

export type ITemplateDefinition = {
    label: string,
    fsName: string,
    isFolder: boolean,
    prompt: string,
}

export type ITemplateSelectionResult = {
    templateDef: ITemplateDefinition,
    itemName: string,
}

export class TemplateSelection {

    public select() {
        const templateNames = templatesConfig.templates.map(entry => entry.label);

        return window.showQuickPick(templateNames)
            .then(async templateName => {
                if (!templateName)
                    return null;

                const idx = templateNames.indexOf(templateName);
                const template = templatesConfig.templates[idx];

                const inputBoxOptions: InputBoxOptions = {
                    prompt: templateName.trim() + ": ",
                    placeHolder: "(Itemname)",
                };

                const itemName = await window.showInputBox(inputBoxOptions);

                if (!itemName)
                    return null;

                return {
                    itemName,
                    templateDef: template,
                };
            });
    }
}