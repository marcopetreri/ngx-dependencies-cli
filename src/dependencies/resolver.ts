import Logger from '../logger';
import { DependencyCruiser } from './cruiser';
import DependencySorter from './sorter';
import DependencyValidator from './validator';
import { DependenciesMap, DependencyNode } from './models';
import { Angular, AngularProjectsMap, AngularProjectData } from 'src/angular';

export class DependencyResolver {
  private _projects: AngularProjectsMap;

  constructor(
    private _cruiser: DependencyCruiser,
    private _sorter: DependencySorter,
    private _validator: DependencyValidator,
    private _ng: Angular
  ) {
    this._projects = this._ng.getProjects();
  }

  public resolveProjectsAffectedBy<T>(projectName: string): DependencyNode<T>[] {
    const allProjects = this._ng.getProjectsNames();

    return allProjects
      .map(project => this.resolveProjectDependencies<T>(project, 0))
      .filter(node => node.childrenNames.includes(projectName));
  }

  public resolveProjectDependencies<T>(projectName: string, maxDepth?: number): DependencyNode<T> {
    const rootNode = this._createDependencyNode(
      projectName,
      new Map<string, DependencyNode<T>>(),
      this._projects.get(projectName) as any
    );
    return this._recursingResolveDependencyNode<T>(rootNode, maxDepth);
  }

  private _recursingResolveDependencyNode<T>(
    node: DependencyNode<T>,
    maxDepth?: number
  ): DependencyNode<T> {
    Logger.groupF`{blue >} Resolving node {blue ${node.name}}`;
    Logger.logF`Depth: {blue ${node.gen}}`;

    node.children = this._getNodeDependenciesMap(node);
    Logger.log('Dependencies found:', node.flatDistinctChildren().map(dep => dep.name));

    if (maxDepth != null && maxDepth === node.gen) {
      Logger.groupEnd();
      Logger.logF`Max depth {yellow ${maxDepth}} reached.`;
      return node;
    }

    [...node.children].forEach(([name, cNode]) => {
      this._recursingResolveDependencyNode(cNode, maxDepth);
    });

    Logger.groupEnd();

    return node;
  }

  private _getNodeDependenciesMap<AngularProjectData>(
    node: DependencyNode<AngularProjectData>
  ): DependenciesMap<AngularProjectData> {
    const paths = this._ng.getProjectFilesPaths(node.data);
    const imports = this._cruiser.getProjectImports(paths);
    const validated = this._validator.getValidatedProjects(imports);
    const entries = validated.map(
      dep =>
        [dep, this._createDependencyNode(dep, new Map(), this._projects.get(dep), node)] as [
          string,
          DependencyNode<AngularProjectData>
        ]
    );
    return new Map(entries);
  }

  private _createDependencyNode<T>(
    name: string,
    children: DependenciesMap<T>,
    data?: T,
    parent?: DependencyNode<T>
  ): DependencyNode<T> {
    return new DependencyNode(name, children, data, parent);
  }

  // private _getSortedDependenciesList(depsMap: DependenciesMap) {
  //   return this._sorter.getTopologicalSortedDependencies(
  //     this._ng.filterProjects(this._projects, { names: [...depsMap.keys()] }),
  //     depsMap
  //   );
  // }

  // private _getNotRecursedDependencies(
  //   list: string[],
  //   depsMap: DependenciesMap
  // ): string[] {
  //   return list.filter(pName => !depsMap.has(pName));
  // }

  // private _createDependenciesMap<T>(list: string[]): DependenciesMap<T> {
  //   return new Map(list.map(name => [name, new DependencyNode<T>(name)]));
  // }
}
