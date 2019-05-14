import Logger from '../logger';
import Angular from '../angular';
import DependencyResolver from '../dependencies/resolver';
import { Command } from 'commander';

export const getListCommand = (
  logger: Logger,
  ng: Angular,
  resolver: DependencyResolver
) => (project: string, otherProjects: string[], cmd: Command) => {
  let depsList: string[] = [];

  if (cmd.affected) {
    depsList = resolver.resolveProjectsListAffecteds([
      project,
      ...otherProjects
    ]);
  } else if (cmd.dependant) {
    depsList = resolver.resolveProjectsListDependencies([
      project,
      ...otherProjects
    ]);
  }

  logger.dir(depsList);
};
