import Logger from './logger';
import AngularCLI from '@angular/cli';
import { resolve } from '@angular-devkit/core/node';

export type AngularCLI = (opts: {
  testing?: boolean;
  cliArgs: string[];
}) => Promise<number>;

export type ProjectsMap = Map<string, any>;

export enum AngularProjectTypes {
  LIB = 'library',
  APP = 'application'
}

export interface ProjectFilters {
  type?: AngularProjectTypes;
  names?: string[];
}

export default class Angular {
  private _cli: AngularCLI;
  private _json: any;

  constructor(private _rootPath: string, private _logger: Logger) {
    this._json = this._getJSON();
    this._cli = this._getCLI();
  }

  public get cli() {
    return this._cli;
  }

  public getProjects(): ProjectsMap {
    return new Map(Object.entries(this._json.projects));
  }

  public filterProjects(
    projects: ProjectsMap,
    { type, names }: ProjectFilters
  ): ProjectsMap {
    let entries = [...projects];
    if (names) {
      entries = entries.filter(this._getProjectsNamesFilterFn(names));
    }
    if (type) {
      entries = entries.filter(this._getProjectsTypeFilterFn(type));
    }
    return new Map(entries);
  }

  public getProjectFilesPaths(
    projectRootPath: string,
    type: AngularProjectTypes
  ): string[] {
    return [
      `${this._rootPath}/${projectRootPath}` +
        (type === 'library' ? '/src/lib/**/*.ts' : '/src/app/**/*.ts')
    ];
  }

  public getProjectsNames(): string[] {
    return Object.keys(this._json.projects);
  }

  public validateProjectType(type: string): boolean {
    return [AngularProjectTypes.APP, AngularProjectTypes.LIB].includes(
      type as AngularProjectTypes
    );
  }

  private _getProjectsTypeFilterFn(type: AngularProjectTypes) {
    return ([, projectData]) => projectData.projectType === type;
  }

  private _getProjectsNamesFilterFn(names: string[]) {
    return ([name, ,]) => names.includes(name);
  }

  private _getJSON(): Object {
    const p = this._rootPath;
    let json: Object;
    try {
      json = require(p + '/angular.json');
    } catch (e) {
      this._logger.error(`No angular.json file found in ${this._rootPath}`, e);
      throw e;
    }
    return json;
  }

  private _getCLI() {
    return AngularCLI;
  }
}
