import { Command } from 'commander';
import { extractUnknownOptions } from '../utils';
import { Angular, AngularProjectTypes, AngularProjectData } from '../angular';
import Logger from '../logger';
import { DependencyResolver } from '../dependencies/resolver';
import { DependencyNode } from 'src/dependencies/models';

export const getBuildCommand = (ng: Angular, resolver: DependencyResolver) => (
  project: string,
  otherProjects: string[],
  cmd: Command
) => {
  const remaining = extractUnknownOptions(cmd);

  let prjsList: string[] = [];
  let depsTree: DependencyNode<AngularProjectData>;

  if (cmd.libraries) {
    cmd.filter = AngularProjectTypes.LIB;
  }

  if (cmd.all || cmd.filter) {
    prjsList = ng.getProjectsNames();
    if (cmd.filter) {
      if (ng.validateProjectType(cmd.filter)) {
        const projects = ng.getProjects();
        prjsList = prjsList.filter(prj => projects.get(prj).projectType === cmd.filter);
      } else {
        Logger.error('Provide a valid project type');
        process.exit(0);
      }
    }
  } else if (project) {
    prjsList = [project, ...otherProjects];
  } else {
    Logger.error('Provide a project name or a -A (--all) -F (--filter) option');
    process.exit(0);
  }

  try {
    if (cmd.affected) {
      // depsList = resolver.resolveProjectsListAffecteds(prjsList);
      // depsList = resolver.resolveProjectsListDependencies(depsList);
    } else if (cmd.dependant) {
      depsTree = resolver.resolveProjectDependencies(project);
    } else {
      // depsList = prjsList;
    }
  } catch (e) {
    Logger.error(e);
  }
  Logger.log(depsTree);

  // const operations = depsList.map(dep => () =>
  //   ng.cli({
  //     cliArgs: ['build', dep, ...remaining]
  //   })
  // );

  // const serial = (proms: (() => Promise<number>)[]) =>
  //   proms.reduce(
  //     (prom, func) => prom.then(result => func().then(Array.prototype.concat.bind(result))),
  //     Promise.resolve([])
  //   );

  // serial(operations).then(() => {
  //   logger.success('\n\nOhhhh Yeahhhh!');
  // });
};
