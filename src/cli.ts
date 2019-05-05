#!/usr/bin/env node

import cli, { Command } from 'commander';
import {
  getAngularCLI,
  getAngularJSON,
  getAngularProjectsEntriesByType,
  getAngularProjectByName
} from './angular';
import { getProjectsDependencies } from './dependencies/cruiser';
import { getTopologicalSortedDependencies } from './dependencies/sorter';
import { getLogger } from './logger';
import { extractUnknownOptions } from './utils';

const logger = getLogger(),
  rootPath = process.cwd(),
  aCli = getAngularCLI(rootPath);

let aJSON: any;
try {
  aJSON = getAngularJSON(rootPath);
} catch (e) {
  process.exit(1);
}

cli
  .version('0.1.0', '-v, --version')
  .description('ng-cli wrapper that takes in account for dependencies');

cli
  .command('build [project]', '')
  .allowUnknownOption()
  .option(
    '-l, --libraries',
    'Builds all libraries projects in dependency order'
  )
  .option('-d, --dependant', 'Builds project with its dependencies')
  .action(function(project: string, cmd: Command) {
    logger.dir(cmd);
    const remaining = extractUnknownOptions(cmd);
    logger.dir(remaining);

    let libProjects: [string, {}][];

    if (project) {
      const prj = getAngularProjectByName(project);
      libProjects = [prj];
    } else if (cmd.libraries) {
      libProjects = getAngularProjectsEntriesByType('library', aJSON);
    } else {
      logger.error('Provide a project name or a valid option');
      process.exit(0);
    }

    const deps = getProjectsDependencies(rootPath, libProjects);
    logger.dir(deps);
    const sortedDepsName = getTopologicalSortedDependencies(deps);
    logger.dir(sortedDepsName);

    const res = sortedDepsName.map(lib => () =>
      aCli({
        cliArgs: ['build', lib]
      })
    );

    const serial = proms =>
      proms.reduce(
        (prom, func) =>
          prom.then(result => func().then(Array.prototype.concat.bind(result))),
        Promise.resolve([])
      );

    serial(res).then(() => {
      logger.log('\n\nOhhhh Yeahhhh!');
    });
  });

cli.command('list').action(() => {
  const libProjects = getAngularProjectsEntriesByType('library', aJSON);
  const deps = getProjectsDependencies(rootPath, libProjects);
  const sortedDepsName = getTopologicalSortedDependencies(deps);
  logger.dir(sortedDepsName);
});

cli.parse(process.argv);
