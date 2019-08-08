import AngularCLI from '@angular/cli';
import {
  AngularProjectsMap,
  AngularProjectFilters,
  AngularProjectTypes,
  AngularProjectData
} from './models';
import Logger from '../logger';

export class Angular {
  private _cli: typeof AngularCLI;
  private _json: any;

  constructor(private _rootPath: string) {
    this._json = this._getJSON();
    this._cli = this._getCLI();
  }

  public get cli() {
    return this._cli;
  }

  public getProjects(): AngularProjectsMap {
    return new Map(Object.entries(this._json.projects));
  }

  public filterProjects(
    projects: AngularProjectsMap,
    { type, names }: AngularProjectFilters
  ): AngularProjectsMap {
    let entries = [...projects];
    if (names) {
      entries = entries.filter(this._getProjectsNamesFilterFn(names));
    }
    if (type) {
      entries = entries.filter(this._getProjectsTypeFilterFn(type));
    }
    return new Map(entries);
  }

  public getProjectFilesPaths(project: AngularProjectData): string[] {
    return [
      `${this._rootPath}/${project.sourceRoot}` +
        (project.projectType === 'library' ? '/lib/**/*.ts' : '/app/**/*.ts')
    ];
  }

  public getProjectsNames(): string[] {
    return Object.keys(this._json.projects);
  }

  public validateProjectType(type: string): boolean {
    return [AngularProjectTypes.APP, AngularProjectTypes.LIB].includes(type as AngularProjectTypes);
  }

  public validateProject(project: string): boolean {
    return Object.keys(this._json.projects).includes(project);
  }

  public getProjectValidatorFn(): (project: string) => boolean {
    return (project: string) => this.validateProject(project);
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
      Logger.error(`No angular.json file found in ${this._rootPath}`, e);
      throw e;
    }
    return json;
  }

  private _getCLI() {
    return AngularCLI;
  }
}
