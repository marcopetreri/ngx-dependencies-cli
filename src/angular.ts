import { getLogger } from './logger';
import AngularCLI from '@angular/cli';
import { resolve } from '@angular-devkit/core/node';

const logger = getLogger();

export type AngularProjectType = 'library' | 'application';

function getProjectsTypeFilterFn(type: AngularProjectType) {
  return ([, projectData]) => projectData.projectType === type;
}

export function getProjectFilesPaths(rootPath: string, projectData: any) {
  return [
    `${rootPath}/${projectData.root}` +
      (projectData.projectType === 'library'
        ? '/src/lib/**/*.ts'
        : '/src/app/**/*.ts')
  ];
}

export function getAngularCLI(rootPath: string) {
  let cli: (opts: { testing?: boolean; cliArgs: string[] }) => Promise<number>;

  try {
    const localNgCli = resolve('@angular/cli', {
      checkGlobal: false,
      basedir: rootPath,
      preserveSymlinks: true,
      checkLocal: true
    });

    cli = require(localNgCli);

    if ('default' in cli) {
      cli = cli['default'];
    }
  } catch (e) {
    logger.error('No local cli available');
    cli = require('./cli');
  }
  return function(opts: { testing?: boolean; cliArgs: string[] }) {
    const _cli = cli;

    return AngularCLI(opts).catch(err => {
      logger.error('Unknown error: ' + err.toString());
      process.exit(127);
    });
  };
}

export function getAngularJSON(rootPath?: string): any {
  const p = rootPath || process.cwd();
  let json: {};
  try {
    json = require(p + '/angular.json');
  } catch (e) {
    logger.error('No angular.json file found', e);
    throw e;
  }
  return json;
}

export function getAngularProjectsEntriesByType(
  type?: AngularProjectType,
  angularJSON?: any
) {
  if (type !== 'application' && type !== 'library') {
    logger.error(`Type ${type} is not an Angular project`);
    return [];
  }
  const t = type || 'library';
  const j = angularJSON || getAngularJSON();
  return Object.entries(j.projects).filter(getProjectsTypeFilterFn(t));
}

export function getAngularProjectByName(name: string, angularJSON?: any) {
  const j = angularJSON || getAngularJSON();
  return Object.entries(j.projects).find(([pName]) => pName === name);
}

export function getExistingAngularProjectsNames(angularJSON?: any) {
  const j = angularJSON || getAngularJSON();
  return Object.keys(j.projects);
}
