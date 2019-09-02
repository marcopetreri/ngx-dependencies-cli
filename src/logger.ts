import chalk from 'chalk';
import treeify from 'treeify';

export default class Logger {
  private static style = chalk;
  public static debugMode = false;

  public static isDebugMode(): boolean {
    return Logger.debugMode;
  }

  public static log(...args: any[]) {
    console.log(...args);
  }

  public static logF(args: TemplateStringsArray, ...placeholders: any[]) {
    console.log(Logger.format(args, placeholders));
  }

  public static message(...args: any[]) {
    console.log(...this._formatString(args, chalk.blue));
  }

  public static warn(...args: any[]) {
    console.warn(...this._formatString(args, chalk.yellow));
  }

  public static error(...args: any[]) {
    console.error(...this._formatString(args, chalk.bold.red));
  }

  public static success(...args: any[]) {
    console.log(...this._formatString(args, chalk.bold.green));
  }

  public static dir(o: {}, depth?: number) {
    console.dir(o, { depth });
  }

  public static tree(o: {}, values = true) {
    console.log(treeify.asTree(o, values, false));
  }

  public static group(...labels: any[]) {
    console.group(...labels);
  }

  public static groupF(args: TemplateStringsArray, ...placeholders: any[]) {
    console.group(Logger.format(args, placeholders));
  }

  public static groupCollapsedF(...labels: any[]) {
    console.groupCollapsed(...labels);
  }

  public static groupEnd() {
    console.groupEnd();
  }

  public static format(args: TemplateStringsArray, placeholders: any[]): string {
    return Logger.style(this._manageTemplateForChalk(args, placeholders));
  }

  private static _formatString(args: any[], formatter: (s: string) => string): any[] {
    return args.map(arg => (typeof arg === 'string' ? formatter(arg) : arg));
  }

  private static _manageTemplateForChalk(
    template: TemplateStringsArray,
    placeholders: any[]
  ): TemplateStringsArray {
    var raws = [];
    var templateParts = [];

    template.forEach((part, i) => {
      raws.push(template.raw[i]);
      templateParts.push(part);

      if (i < placeholders.length) {
        raws.push(placeholders[i]);
        templateParts.push(placeholders[i]);
      }
    });

    var newTemplate = [templateParts.join('')] as any;
    newTemplate.raw = [raws.join('')];

    return newTemplate as TemplateStringsArray;
  }
}
