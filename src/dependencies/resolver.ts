import DependencyCruiser, { DependenciesMap } from './cruiser';
import DependencySorter from './sorter';
import DependencyValidator from './validator';
import Angular, { ProjectsMap } from 'src/angular';
import Logger from 'src/logger';

export default class DependencyResolver {
  private _projects: ProjectsMap;
  private _currentGen = 0;

  constructor(
    private _cruiser: DependencyCruiser,
    private _sorter: DependencySorter,
    private _validator: DependencyValidator,
    private _ng: Angular,
    private _logger: Logger
  ) {
    this._projects = this._ng.getProjects();
  }

  public resolveProjectsListAffecteds(list: string[]): string[] {
    const allDepsMap = this._recurseResolveProjectListDependencies(
      this._ng.getProjectsNames()
    );
    this._logger.dir(allDepsMap);
    const affecteds = [...allDepsMap]
      .filter(([, pDeps]) => pDeps.some(pDep => list.includes(pDep)))
      .map(([pName]) => pName);
    this._logger.dir(affecteds);
    const depsMap = this._recurseResolveProjectListDependencies(affecteds);
    this._logger.dir(depsMap);
    return this._getSortedDependenciesList(depsMap);
  }

  public resolveProjectsListDependencies(list: string[]): string[] {
    const depsMap = this._recurseResolveProjectListDependencies(list);
    this._logger.dir(depsMap);
    return this._getSortedDependenciesList(depsMap);
  }

  private _getProjectsDependenciesMap(projects: ProjectsMap): DependenciesMap {
    const deps = this._cruiser.getProjectsDependencies(projects);
    return this._validator.getValidatedDependencies(deps);
  }

  private _recurseResolveProjectListDependencies(
    list: string[]
  ): DependenciesMap {
    // this._currentGen++;
    let projectsMap = this._ng.filterProjects(this._projects, { names: list });
    const depsMap = this._getProjectsDependenciesMap(projectsMap);
    // this._logger.log(`node ${this._currentGen}: `, depsMap);

    return [...depsMap]
      .map(([, pDeps]) => {
        return this._recurseResolveProjectListDependencies(pDeps);
      })
      .reduce((map, val) => {
        return new Map([...map, ...val]);
      }, depsMap);
  }

  private _getSortedDependenciesList(depsMap: DependenciesMap) {
    return this._sorter.getTopologicalSortedDependencies(
      this._ng.filterProjects(this._projects, { names: [...depsMap.keys()] }),
      depsMap
    );
  }
}
