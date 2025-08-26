"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const ChildProcess = require("child_process");
const fs = require("fs");
const path = require("path");
let parseSync = require('csv-parse/lib/sync');
class ApexPmd {
    constructor(outputChannel, pmdPath, defaultRuleset, errorThreshold, warningThreshold) {
        this._rulesetPath = defaultRuleset;
        this._pmdPath = pmdPath;
        this._errorThreshold = errorThreshold;
        this._warningThreshold = warningThreshold;
        this._outputChannel = outputChannel;
        this._outputCols = '"Problem","Package","File","Priority","Line","Description","Ruleset","Rule"'
            .replace(/"/g, "")
            .split(',')
            .map(x => x.toLowerCase());
        // Create statusbarItem as needed
        if (!this._statusBarItem) {
            this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        }
        // Get the current text editor
        let editor = vscode.window.activeTextEditor;
        // no editor? hide statusBarItem
        if (!editor) {
            this._statusBarItem.hide();
            return;
        }
    }
    // update the statusbar with the issues count
    updateStatusBarItem(count) {
        if (count > 0) {
            // Update the status bar
            this._statusBarItem.text = count !== 1 ? `$(stop) ${count} ISSUES` : '$(stop) 1 ISSUE';
            this._statusBarItem.show();
        }
        else {
            this._statusBarItem.hide();
        }
    }
    run(targetPath, collection) {
        if (!this.checkPmdPath() || !this.checkRulesetPath())
            return;
        let cmd = this.createPMDCommand(targetPath);
        this._outputChannel.appendLine('PMD Command: ' + cmd);
        ChildProcess.exec(cmd, (error, stdout, stderr) => {
            this._outputChannel.appendLine('error:' + error);
            this._outputChannel.appendLine('stdout:' + stdout);
            this._outputChannel.appendLine('stderr:' + stderr);
            //console.log(`STDOUT: ${stdout.split('\n').length}`)
            let lines = stdout.split('\n').filter(x => x.trim().length > 0);
            //console.log(lines.length)
            this.updateStatusBarItem(lines.length - 1);
            let problemsMap = new Map();
            for (let i = 0; i < lines.length; i++) {
                try {
                    let file = this.getFilePath(lines[i]);
                    let problem = this.createDiagonistic(lines[i]);
                    if (!problem)
                        continue;
                    if (problemsMap.has(file)) {
                        problemsMap.get(file).push(problem);
                    }
                    else {
                        problemsMap.set(file, [problem]);
                    }
                }
                catch (ex) {
                    this._outputChannel.appendLine(ex);
                }
            }
            problemsMap.forEach(function (value, key) {
                let uri = vscode.Uri.file(key);
                vscode.workspace.openTextDocument(uri).then(doc => {
                    //fix ranges to not include whitespace
                    for (let i = 0; i < value.length; i++) {
                        let prob = value[i];
                        let line = doc.lineAt(prob.range.start.line);
                        prob.range = new vscode.Range(new vscode.Position(line.range.start.line, line.firstNonWhitespaceCharacterIndex), line.range.end);
                    }
                    collection.delete(uri);
                    collection.set(uri, value);
                }, reason => {
                    console.log(reason);
                    this._outputChannel.appendLine(reason);
                });
            });
        });
    }
    // util method to parse the given CSV line and provide object
    parseCSVLine(line) {
        //format: "Problem","Package","File","Priority","Line","Description","Ruleset","Rule"
        //console.log(this._outputCols);
        // parse the csv line
        let records = parseSync(line, { columns: this._outputCols });
        if (records != null && records.length > 0) {
            let item = records[0];
            let pcl = {
                lineNum: parseInt(item.line) - 1,
                msg: item.description.replace(/[ ]+/g, " "),
                priority: parseInt(item.priority),
                file: item.file,
                package: item.package,
                ruleset: item.ruleset,
                rule: item.rule
            };
            //console.log('PCL', pcl);
            return pcl;
        }
        return null;
    }
    createDiagonistic(line) {
        //console.log(`LINE: ${line}`);
        let pcl = this.parseCSVLine(line);
        //console.log(`lineNum: ${pcl.lineNum}\nmsg: ${pcl.msg}\n priority: ${pcl.priority}`)
        // ignore if lineNum is not a number
        if (isNaN(pcl.lineNum)) {
            return null;
        }
        let level;
        if (pcl.priority <= this._errorThreshold) {
            level = vscode.DiagnosticSeverity.Error;
        }
        else if (pcl.priority <= this._warningThreshold) {
            level = vscode.DiagnosticSeverity.Warning;
        }
        else {
            level = vscode.DiagnosticSeverity.Hint;
        }
        let problem = new vscode.Diagnostic(new vscode.Range(new vscode.Position(pcl.lineNum, 0), new vscode.Position(pcl.lineNum, 100)), pcl.msg, level);
        return problem;
    }
    getFilePath(line) {
        let parts = line.split(',');
        return this.stripQuotes(parts[2]);
    }
    createPMDCommand(targetPath) {
        // let cmd = `java -cp "${path.join(this._pmdPath, 'lib', '*')}" net.sourceforge.pmd.PMD -d "${targetPath}" -f csv -R "${this._rulesetPath}"`;
        let cmd = `java -cp "${path.join(this._pmdPath, 'lib', '*')}" net.sourceforge.pmd.cli.PmdCli check -d "${targetPath}" -f csv -R "${this._rulesetPath}"`;
        console.log(`CMD: ${cmd}`);
        return cmd;
    }
    checkPmdPath() {
        if (this.dirExists(this._pmdPath)) {
            return true;
        }
        this._outputChannel.appendLine(this._pmdPath);
        vscode.window.showErrorMessage('PMD Path not set. Please see Installation Instructions.');
        return false;
    }
    checkRulesetPath() {
        if (this.fileExists(this._rulesetPath)) {
            console.log(`Ruleset Path: ${this._rulesetPath}`);
            return true;
        }
        vscode.window.showErrorMessage(`No Ruleset not found at ${this._rulesetPath}. Ensure configuration correct or change back to the default.`);
        return false;
    }
    //=== Util ===
    fileExists(filePath) {
        try {
            let stat = fs.statSync(filePath);
            return stat.isFile();
        }
        catch (err) {
            return false;
        }
    }
    dirExists(filePath) {
        try {
            let stat = fs.statSync(filePath);
            return stat.isDirectory();
        }
        catch (err) {
            return false;
        }
    }
    stripQuotes(s) {
        return s.substr(1, s.length - 2);
    }
}
exports.ApexPmd = ApexPmd;
//# sourceMappingURL=apexPmd.js.map