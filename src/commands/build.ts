import { Command } from 'commander';
import { extractUnknownOptions } from '../utils';
import Angular, { AngularProjectTypes } from '../angular';
import Logger from '../logger';
import DependencyResolver from '../dependencies/resolver';

export const getBuildCommand = (
  logger: Logger,
  ng: Angular,
  resolver: DependencyResolver
) => (project: string, otherProjects: string[], cmd: Command) => {
  // logger.log(project, otherProjects);
  logger.dir(cmd);
  const remaining = extractUnknownOptions(cmd);
  // logger.dir(remaining);

  let prjsList: string[] = [];
  let depsList: string[] = [];

  if (cmd.libraries) {
    cmd.filter = AngularProjectTypes.LIB;
  }

  if (cmd.all || cmd.filter) {
    prjsList = ng.getProjectsNames();
    if (cmd.filter) {
      if (ng.validateProjectType(cmd.filter)) {
        const projects = ng.getProjects();
        prjsList = prjsList.filter(
          prj => projects.get(prj).projectType === cmd.filter
        );
      } else {
        logger.error('Provide a valid project type');
        process.exit(0);
      }
    }
  } else if (project) {
    prjsList = [project, ...otherProjects];
  } else {
    logger.error('Provide a project name or a -A (--all) -F (--filter) option');
    process.exit(0);
  }

  try {
    if (cmd.affected) {
      depsList = resolver.resolveProjectsListAffecteds(prjsList);
      depsList = resolver.resolveProjectsListDependencies(depsList);
    } else if (cmd.dependant) {
      depsList = resolver.resolveProjectsListDependencies(prjsList);
    } else {
      depsList = prjsList;
    }
  } catch (e) {
    logger.error(e);
  }
  logger.dir(depsList);

  const operations = depsList.map(dep => () =>
    ng.cli({
      cliArgs: ['build', dep, ...remaining]
    })
  );

  const serial = (proms: (() => Promise<number>)[]) =>
    proms.reduce(
      (prom, func) =>
        prom.then(result => func().then(Array.prototype.concat.bind(result))),
      Promise.resolve([])
    );

  serial(operations).then(() => {
    logger.success('\n\nOhhhh Yeahhhh!');
  });
};
