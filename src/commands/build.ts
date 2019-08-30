import { Command } from 'commander';
import { extractUnknownOptions } from '../utils';
import { Angular, AngularProjectData } from '../angular';
import Logger from '../logger';
import { DependencyResolver } from '../dependencies/resolver';
import DependencySorter from 'src/dependencies/sorter';
import { DependencyNode } from 'src/dependencies/models';

export const getBuildCommand = (
  ng: Angular,
  resolver: DependencyResolver,
  sorter: DependencySorter
) => (project: string, cmd: Command) => {
  const remaining = extractUnknownOptions(cmd);

  let buildList: DependencyNode<AngularProjectData>[] = [];

  try {
    if (cmd.affected) {
      // depsList = resolver.resolveProjectsListAffecteds(prjsList);
      // depsList = resolver.resolveProjectsListDependencies(depsList);
      const depsTrees = resolver.resolveProjectsAffectedBy<AngularProjectData>(project);
    } else {
      const depsTree = resolver.resolveProjectDependencies<AngularProjectData>(project);
      buildList = sorter.getSortedDependencies(depsTree, true);
    }
  } catch (e) {
    Logger.error(e);
  }

  const operations = buildList.map(dep => () =>
    ng.cli({
      cliArgs: ['build', dep.name, ...remaining]
    })
  );

  const serial = (proms: (() => Promise<number>)[]) =>
    proms.reduce(
      (prom, func) => prom.then(result => func().then(Array.prototype.concat.bind(result))),
      Promise.resolve([])
    );

  serial(operations)
    .then(() => {
      Logger.success('Build Success!');
    })
    .catch(() => {
      Logger.error('Build Failed!');
    });
};
