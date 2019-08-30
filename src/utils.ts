import { Option, Command } from 'commander';
import DependencyValidator from './dependencies/validator';
import Logger from './logger';

export function validateProjectArg(validator: DependencyValidator, fn: (...args: any[]) => void) {
  return (...args: any[]) => {
    const [project]: string[] = args;
    if (validator.getValidatedProjects([project]).length > 0) {
      fn(...args);
    } else {
      Logger.error(`'${project}' is not a valid project. Please provide a valid one.`);
    }
  };
}

export function extractUnknownOptions(command: Command) {
  const i = command.parent.rawArgs.findIndex((item: string) => item.startsWith('--'));
  return (
    (i >= 0 &&
      (command.parent.rawArgs as string[]).splice(i).filter((item, index, array) => {
        if (command.options.find(o => o.short === item || o.long === item)) {
          return false;
        }

        const prevKeyRaw = array[index - 1];
        if (prevKeyRaw) {
          const previousKey = prevKeyRaw.replace('--', '').replace('no', '');
          if (command[previousKey] === item) {
            return false;
          }
        }

        return true;
      })) ||
    []
  );
}

export function parseBoolean(val: any) {
  switch (val) {
    case 'false':
    case '0':
      return false;
    case 'true':
    case '1':
    default:
      return true;
  }
}
