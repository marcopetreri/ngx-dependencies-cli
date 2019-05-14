import DependencyCruiser, { DependenciesMap } from './cruiser';
import DependencySorter from './sorter';
import DependencyValidator from './validator';
import Angular, { ProjectsMap } from 'src/angular';
import Logger from 'src/logger';

export default class DependencyResolver {
  private _projects: ProjectsMap;
  private _currentDepth = 0;

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
    const allDepsMap: DependenciesMap = new Map();
    this._recurseResolveProjectListDependencies(
      this._ng.getProjectsNames(),
      allDepsMap
    );
    const affecteds = [...allDepsMap]
      .filter(([, pDeps]) => pDeps.some(pDep => list.includes(pDep)))
      .map(([pName]) => pName);
    // this._logger.dir(affecteds);
    return affecteds;
  }

  public resolveProjectsListDependencies(list: string[]): string[] {
    const depsMap = new Map();
    this._recurseResolveProjectListDependencies(list, depsMap);
    // this._logger.dir(depsMap);
    return this._getSortedDependenciesList(depsMap);
  }

  private _recurseResolveProjectListDependencies(
    list: string[],
    delta: DependenciesMap,
    maxDepth?: number
  ) {
    // this._logger.log('list', list);
    const filteredList = this._getNotRecursedDependencies(list, delta);
    // this._logger.log('filtered list', filteredList);
    if (
      filteredList.length === 0 ||
      (maxDepth && maxDepth === this._currentDepth)
    )
      return;

    let projectsMap = this._ng.filterProjects(this._projects, {
      names: filteredList
    });
    const depsMap = this._getProjectsDependenciesMap(projectsMap);
    this._logger.log(`depth ${this._currentDepth}: `, depsMap);

    this._currentDepth++;

    [...depsMap].forEach(([pName, pDeps]) => {
      delta.set(pName, pDeps);
      if (pDeps.length === 0) return;
      this._recurseResolveProjectListDependencies(pDeps, delta);
    });
  }

  private _getProjectsDependenciesMap(projects: ProjectsMap): DependenciesMap {
    const deps = this._cruiser.getProjectsDependencies(projects);
    return this._validator.getValidatedDependencies(deps);
  }

  private _getSortedDependenciesList(depsMap: DependenciesMap) {
    return this._sorter.getTopologicalSortedDependencies(
      this._ng.filterProjects(this._projects, { names: [...depsMap.keys()] }),
      depsMap
    );
  }

  private _getNotRecursedDependencies(
    list: string[],
    depsMap: DependenciesMap
  ): string[] {
    return list.filter(pName => !depsMap.has(pName));
  }
}
