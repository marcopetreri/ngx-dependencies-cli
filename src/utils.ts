import { Option, Command } from 'commander';

export function extractUnknownOptions(command: Command) {
  return command.parent.rawArgs
    .splice(
      Math.max(
        command.parent.rawArgs.findIndex((item: string) =>
          item.startsWith('--')
        ),
        0
      )
    )
    .filter((item, index, array) => {
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
    });
}
