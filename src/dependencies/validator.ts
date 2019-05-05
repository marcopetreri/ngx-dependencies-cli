import Angular from 'src/angular';
import { DependenciesMap } from './cruiser';

export default class DependencyValidator {
  private _validProjects: string[];
  constructor(private _ng: Angular) {
    this._validProjects = this._ng.getProjectsNames();
  }

  public getValidatedDependencies(
    dependencies: DependenciesMap
  ): DependenciesMap {
    const valids = [...dependencies].map(([name, projectDeps]) => {
      return [name, projectDeps.filter(this._getValidateDependencyFn())] as [
        string,
        string[]
      ];
    });
    return new Map(valids);
  }

  private _getValidateDependencyFn(): (string) => boolean {
    return dep => this._validProjects.includes(dep);
  }
}
