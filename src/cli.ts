#!/usr/bin/env node

import cli, { Command } from 'commander';
import Angular from './angular';
import Logger from './logger';
import { extractUnknownOptions, parseBoolean } from './utils';
import DependencyResolver from './dependencies/resolver';
import DependencyCruiser from './dependencies/cruiser';
import DependencySorter from './dependencies/sorter';
import DependencyValidator from './dependencies/validator';

const logger = new Logger(),
  rootPath = process.cwd();

let ng: Angular;

try {
  ng = new Angular(rootPath, logger);
} catch (e) {
  logger.warn('Exiting from ngd');
  process.exit();
}

const resolver = new DependencyResolver(
  new DependencyCruiser(ng),
  new DependencySorter(),
  new DependencyValidator(ng),
  ng,
  logger
);

cli
  .version('0.1.1', '-v, --version')
  .description('ng-cli wrapper that takes in account for dependencies');

cli
  .command('build [project] [otherProjects...]', '')
  .allowUnknownOption()
  .option('-d, --dependant', 'Builds [projects] with their dependencies', true)
  .option('-a, --affected', 'Builds all projects affected by [projects]')
  .option('-A, --all', 'Builds all projects')
  .option(
    '-F, --filter [type]',
    'Builds projects of certain type (library or application)'
  )
  .action(function(project: string, otherProjects: string[], cmd: Command) {
    // logger.log(project, otherProjects);
    logger.dir(cmd);
    const remaining = extractUnknownOptions(cmd);
    // logger.dir(remaining);

    let prjsList: string[] = [];
    let depsList: string[] = [];

    if (cmd.all || cmd.filter) {
      prjsList = ng.getProjectsNames();
      if (cmd.filter) {
        if (ng.validateProjectType(cmd.filter)) {
          const projects = ng.getProjects();
          prjsList = prjsList.filter(
            prj => projects.get(prj).projectType === cmd.filter
          );
        } else {
          logger.error('Provide a valid project type');
          process.exit(0);
        }
      }
    } else if (project) {
      prjsList = [project, ...otherProjects];
    } else {
      logger.error(
        'Provide a project name or a -A (--all) -F (--filter) option'
      );
      process.exit(0);
    }

    try {
      if (cmd.affected) {
        depsList = resolver.resolveProjectsListAffecteds(prjsList);
      } else if (cmd.dependant) {
        depsList = resolver.resolveProjectsListDependencies(prjsList);
      } else {
        depsList = prjsList;
      }
    } catch (e) {
      logger.error(e);
    }
    logger.dir(depsList);

    // const operations = depsList.map(dep => () =>
    //   ng.cli({
    //     cliArgs: ['build', dep, ...remaining]
    //   })
    // );

    // const serial = (proms: (() => Promise<number>)[]) =>
    //   proms.reduce(
    //     (prom, func) =>
    //       prom.then(result => func().then(Array.prototype.concat.bind(result))),
    //     Promise.resolve([])
    //   );

    // serial(operations).then(() => {
    //   logger.success('\n\nOhhhh Yeahhhh!');
    // });
  });

cli.command('list').action(() => {
  // const libProjects = getAngularProjectsEntriesByType('library', aJSON);
  // const deps = getProjectsDependencies(rootPath, libProjects);
  // const sortedDepsName = getTopologicalSortedDependencies(deps);
  // logger.dir(sortedDepsName);
});

cli.parse(process.argv);
