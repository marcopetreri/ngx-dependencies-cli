import TopologicalSort from 'topological-sort';
import { DependenciesMap } from './cruiser';
import { ProjectsMap } from 'src/angular';

export default class DependencySorter {
  constructor() {}

  getTopologicalSortedDependencies(
    projects: ProjectsMap,
    dependencies: DependenciesMap
  ): string[] {
    const sort = new TopologicalSort(projects);

    [...dependencies].forEach(([name, deps]) => {
      deps.forEach(projectDep => sort.addEdge(name, projectDep));
    });

    return [...sort.sort().keys()].reverse();
  }
}
