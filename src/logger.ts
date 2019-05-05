import chalk from 'chalk';
import treeify from 'treeify';

export default class Logger {
  log(...args: any[]) {
    console.log(...this._format(args, chalk.blue));
  }

  warn(...args: any[]) {
    console.warn(...this._format(args, chalk.bold.yellow));
  }

  error(...args: any[]) {
    console.error(...this._format(args, chalk.bold.red));
  }

  success(...args: any[]) {
    console.log(...this._format(args, chalk.bold.green));
  }

  dir(o: {}) {
    console.dir(o, { depth: null });
  }

  tree(o: {}, values = true) {
    console.log(chalk.cyan.bold(treeify.asTree(o, values, false)));
  }

  private _format(args: any[], formatter: (s: string) => string): any[] {
    return args.map(arg => (typeof arg === 'string' ? formatter(arg) : arg));
  }
}
