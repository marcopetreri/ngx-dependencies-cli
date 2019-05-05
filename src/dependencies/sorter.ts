import TopologicalSort from 'topological-sort';

export function getTopologicalSortedDependencies(
  dependencies: [string, string[]][]
) {
  const sort = new TopologicalSort(new Map(dependencies));

  dependencies.forEach(([projectName, projectDeps]) => {
    projectDeps.forEach(projectDep => sort.addEdge(projectName, projectDep));
  });

  return [...sort.sort().keys()].reverse();
}
