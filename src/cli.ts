#!/usr/bin/env node

import cli, { Command } from 'commander';
import Angular from './angular';
import Logger from './logger';
import { parseBoolean } from './utils';
import DependencyResolver from './dependencies/resolver';
import DependencyCruiser from './dependencies/cruiser';
import DependencySorter from './dependencies/sorter';
import DependencyValidator from './dependencies/validator';
import { getBuildCommand } from './commands/build';
import { getListCommand } from './commands/list';

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
  .option(
    '-d, --dependant [value]',
    'Builds [projects] with their dependencies',
    parseBoolean,
    true
  )
  .option('-a, --affected', 'Builds all projects affected by [projects]')
  .option('-A, --all', 'Builds all projects')
  .option(
    '-F, --filter [type]',
    'Builds projects of certain type (library or application)'
  )
  .option('-l, --libraries', 'Builds all library projects')
  .action(getBuildCommand(logger, ng, resolver));

cli
  .command('list [project] [otherProjects...]')
  .option('-d, --dependant [value]', 'Lists [projects] dependencies', true)
  .option('-a, --affected', 'Lists all projects affected by [projects]')
  .action(getListCommand(logger, ng, resolver));

cli.parse(process.argv);
