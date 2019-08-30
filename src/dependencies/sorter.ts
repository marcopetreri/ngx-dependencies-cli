import TopologicalSort from 'topological-sort';
import { DependencyNode } from './models';

export default class DependencySorter {
  constructor() {}

  public getSortedDependencies<T>(
    node: DependencyNode<T>,
    withRoot?: boolean
  ): DependencyNode<T>[] {
    const sorter = new TopologicalSort(new Map<string, DependencyNode<T>>());
    const deps = node.flatDistinctChildren();

    deps.forEach(node => {
      sorter.addNode(node.name, node);
    });

    deps.forEach(node => {
      node.childrenEntries.forEach(([childName]) => {
        sorter.addEdge(node.name, childName);
      });
    });

    const sorted = [...sorter.sort().values()].map(node => node.node);
    if (withRoot) {
      sorted.push(node);
    }
    return sorted.reverse();
  }

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
