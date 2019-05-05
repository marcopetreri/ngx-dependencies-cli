import { cruise } from 'dependency-cruiser';
import {
  getProjectFilesPaths,
  getExistingAngularProjectsNames
} from '../angular';
import { getLogger } from '../logger';

const logger = getLogger();
const projectsNames = getExistingAngularProjectsNames();

export function getProjectDependencies(
  rootPath: string,
  project: [string, {}]
): [string, string[]] {
  const [projectName, projectData] = project;

  const paths = getProjectFilesPaths(rootPath, projectData);

  const cruised = cruise(paths, {
    exclude: '(node_modules)',
    tsPreCompilationDeps: true
  });

  const deps = cruised.modules
    .filter((module: { source: string }) =>
      projectsNames.find(pName => pName === module.source)
    )
    .map((module: { source: string }) => module.source) as string[];

  return [projectName, deps];
}

export function getProjectsDependencies(
  rootPath: string,
  projects: [string, {}][]
): [string, string[]][] {
  return projects.map(project => getProjectDependencies(rootPath, project));
}
