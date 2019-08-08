import TopologicalSort from 'topological-sort';

export default class DependencySorter {
  constructor() {}

  // getTopologicalSortedDependencies(
  //   projects: AngularProjectsMap,
  //   dependencies: DependenciesMap
  // ): string[] {
  //   const sort = new TopologicalSort(projects);

  //   [...dependencies].forEach(([name, deps]) => {
  //     deps.forEach(projectDep => sort.addEdge(name, projectDep));
  //   });

  //   return [...sort.sort().keys()].reverse();
  // }
}
