import { cruise } from 'dependency-cruiser';
import Angular, { ProjectsMap } from '../angular';

export type DependenciesMap = Map<string, string[]>;

export default class DependencyCruiser {
  constructor(private _ng: Angular) {}

  public getProjectDependencies(projectData: any): string[] {
    const paths = this._ng.getProjectFilesPaths(
      projectData.root,
      projectData.projectType
    );

    const cruised = cruise(paths, {
      exclude: '(node_modules)',
      tsPreCompilationDeps: true
    });

    const deps = cruised.modules.map(
      (module: { source: string }) => module.source
    ) as string[];

    return deps;
  }

  getProjectsDependencies(projects: ProjectsMap): DependenciesMap {
    const deps = [...projects].map(
      ([name, data]) =>
        [name, this.getProjectDependencies(data)] as [string, string[]]
    );
    return new Map(deps);
  }
}
