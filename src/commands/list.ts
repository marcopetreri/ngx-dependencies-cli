import Logger from '../logger';
import { Angular, AngularProjectData } from '../angular';
import { DependencyResolver } from '../dependencies/resolver';
import { Command } from 'commander';
import { DependencyNode } from '../dependencies/models';

export const getListCommand = (ng: Angular, resolver: DependencyResolver) => (
  project: string,
  otherProjects: string[],
  cmd: Command
) => {
  Logger.dir(cmd);

  let depsTree: DependencyNode<AngularProjectData>;

  const recursive = cmd.recursive ? null : cmd.generation ? cmd.generation : 0;

  if (cmd.affected) {
    // depsList = resolver.resolveProjectsListAffecteds([
    //   project,
    //   ...otherProjects
    // ]);
  } else {
    depsTree = resolver.resolveProjectDependencies(project, recursive);
  }

  const depsNames = depsTree.getDependenciesNames();

  Logger.logF`Found {green.bold ${depsNames.length}} dependencies: {green.bold ${depsNames.join(
    ', '
  )}}`;
};
