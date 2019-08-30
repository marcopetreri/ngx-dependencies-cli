import { cruise } from 'dependency-cruiser';
import { PathsMap } from './models';
import Logger from '../logger';

export class DependencyCruiser {
  constructor() {}

  public getProjectImports(filesPaths: string[]): string[] {
    const cruised = cruise(filesPaths, {
      exclude: '(node_modules)',
      tsPreCompilationDeps: true
    });

    const deps = cruised.modules.map((module: { source: string }) => module.source) as string[];

    return deps;
  }

  getProjectsImports(projectsFilesPaths: PathsMap): PathsMap {
    const deps = [...projectsFilesPaths].map(
      ([name, paths]) => [name, this.getProjectImports(paths)] as [string, string[]]
    );
    return new Map(deps);
  }
}
