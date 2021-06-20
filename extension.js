const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
    let EDITOR = vscode.window.activeTextEditor
    let DEBOUNCE_DELAY = 200
    let PREVIOUS_MILLIS = Date.now()
    let PREVIOUS_KEY = false
    let VISIT_ERRORS = 0
    let SESSION_ERRORS = 0
    let DISPLAY_FEEDBACK = true

    // Prompts user for input to set millis value
    let setMillis = vscode.commands.registerCommand('debounce.setMillis', () => {
        if (!DISPLAY_FEEDBACK) return
        vscode.window.showInputBox().then(input => {
            const previousValue = DEBOUNCE_DELAY
            DEBOUNCE_DELAY = input
            vscode.window.showInformationMessage((previousValue == DEBOUNCE_DELAY) ?
                `Debounce delay is still set to ${DEBOUNCE_DELAY} millis.` :
                `Debounce delay adjusted from ${previousValue} to ${DEBOUNCE_DELAY} millis.`)
        })
    })

    // Displays current debounce value in millis
    let displayMillis = vscode.commands.registerCommand('debounce.displayMillis', () => {
        if (!DISPLAY_FEEDBACK) return
        vscode.window.showInformationMessage(`Current debounce set to ${DEBOUNCE_DELAY} millis.`)
    })

    // Displays numbers of errors
    let displayErrors = vscode.commands.registerCommand('debounce.displayErrors', () => {
        if (!DISPLAY_FEEDBACK) return
        vscode.window.showInformationMessage(`Debounce has made ${VISIT_ERRORS} corrections since editor view changed.\nDebounce has made ${SESSION_ERRORS} corrections since VSCode started.`)
    })

    // Enables information messages
    let enableFeedback = vscode.commands.registerCommand('debounce.enableFeedback', () => {
        DISPLAY_FEEDBACK = true
        vscode.window.showInformationMessage(`Feedback enabled.`)
    })

    // Disables information messages
    let disableFeedback = vscode.commands.registerCommand('debounce.disableFeedback', () => {
        DISPLAY_FEEDBACK = false
        vscode.window.showInformationMessage(`Feedback disabled.`)
    })

    context.subscriptions.push(setMillis)
    context.subscriptions.push(displayMillis)
    context.subscriptions.push(displayErrors)
    context.subscriptions.push(enableFeedback)
    context.subscriptions.push(disableFeedback)

    vscode.window.onDidChangeActiveTextEditor(() => {
        EDITOR = vscode.window.activeTextEditor
        vscode.commands.executeCommand('debounce.displayErrors')
        VISIT_ERRORS = 0
    })

    vscode.workspace.onDidChangeTextDocument(event => {
        const currentMillis = Date.now()
        if (event.contentChanges[0].text == PREVIOUS_KEY && event.contentChanges[0].text != '')
            if (currentMillis - PREVIOUS_MILLIS < DEBOUNCE_DELAY)
                EDITOR.edit(editBuilder => {
                    const range = new vscode.Range(
                        event.contentChanges[0].range._start._line,
                        event.contentChanges[0].range._start._character,
                        event.contentChanges[0].range._end._line,
                        event.contentChanges[0].range._end._character + 1)
                    editBuilder.replace(range, '')
                    VISIT_ERRORS++
                    SESSION_ERRORS++
                })
        PREVIOUS_MILLIS = currentMillis
        PREVIOUS_KEY = event.contentChanges[0].text
    })

}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}