#!/usr/bin/env node

import cli from 'commander';
import { Angular } from './angular/angular';
import Logger from './logger';
import { parseBoolean, validateProjectArg } from './utils';
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

const cruiser = new DependencyCruiser(),
  validator = new DependencyValidator(ng),
  sorter = new DependencySorter();

const resolver = new DependencyResolver(cruiser, sorter, validator, ng);

cli
  .version('1.0.3', '-v, --version')
  .description('ng-cli wrapper that takes in account for dependencies')
  .option('-d, --debug', 'output debug informations', false);

cli
  .command('build [project]')
  .description('builds [project] with its dependencies')
  .allowUnknownOption()
  // .option('-a, --affected', 'Builds all projects affected by [projects]')
  // .option('-A, --all', 'Builds all projects')
  // .option('-F, --filter [type]', 'Builds projects of certain type (library or application)')
  // .option('-l, --libraries', 'Builds all library projects')
  .action(validateProjectArg(validator, getBuildCommand(ng, resolver, sorter)));

cli
  .command('list [project]')
  .description('lists [project] dependencies')
  .option('-a, --affected', 'lists all projects affected by [project]')
  .option('-s, --sorted', 'lists dependencies topologically sorted')
  .option('-r, --recursive', 'applies recursive strategy to resolve the dependencies')
  .option(
    '-g, --generation [value]',
    'stops the dependencies resolve to [value] generation',
    parseInt
  )
  .action(validateProjectArg(validator, getListCommand(ng, resolver, sorter)));

cli.on('option:debug', () => {
  Logger.debugMode = true;
});

if (!process.argv.slice(2).length) {
  cli.help();
}

cli.parse(process.argv);
