#!/usr/bin/env node

import cli from 'commander';
import { Angular } from './angular/angular';
import Logger from './logger';
import { parseBoolean } from './utils';
import { DependencyResolver } from './dependencies/resolver';
import { DependencyCruiser } from './dependencies/cruiser';
import DependencySorter from './dependencies/sorter';
import DependencyValidator from './dependencies/validator';
import { getBuildCommand } from './commands/build';
import { getListCommand } from './commands/list';

import 'source-map-support/register';

const rootPath = process.cwd();

let ng: Angular;

try {
  ng = new Angular(rootPath);
} catch (e) {
  Logger.warn('Exiting from ngd');
  process.exit();
}

const resolver = new DependencyResolver(
  new DependencyCruiser(),
  new DependencySorter(),
  new DependencyValidator(),
  ng
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
  .option('-F, --filter [type]', 'Builds projects of certain type (library or application)')
  .option('-l, --libraries', 'Builds all library projects')
  .action(getBuildCommand(ng, resolver));

cli
  .command('list [project] [otherProjects...]')
  .description('It Lists [projects] dependencies')
  .option('-a, --affected', 'Lists all projects affected by [projects]')
  .option('-r, --recursive', 'Applies recursive strategy to resolve the dependencies')
  .option(
    '-g, --generation [value]',
    'Stop the dependencies resolve to [value] generation',
    parseInt
  )
  .action(getListCommand(ng, resolver));

cli.option('--debug [value]', 'Prints debug informations', false);

cli.parse(process.argv);
