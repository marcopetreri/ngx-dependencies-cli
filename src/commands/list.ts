import Logger from '../logger';
import { Angular, AngularProjectData } from '../angular';
import { DependencyResolver } from '../dependencies/resolver';
import { Command } from 'commander';
import { DependencyNode } from '../dependencies/models';
import DependencySorter from 'src/dependencies/sorter';

export const getListCommand = (
  ng: Angular,
  resolver: DependencyResolver,
  sorter: DependencySorter
) => (project: string, cmd: Command) => {
  const recursive = cmd.recursive ? null : cmd.generation ? cmd.generation : 0;

  if (cmd.affected) {
    const depsList = resolver.resolveProjectsAffectedBy<AngularProjectData>(project);
    Logger.logF`{green >} Found {green ${
      depsList.length
    }} projects affected by {yellow ${project}}${(depsList.length > 0 && ':') ||
      '.'} {green ${depsList.map(dep => dep.name).join(', ')}}`;
  } else {
    const depsTree = resolver.resolveProjectDependencies<AngularProjectData>(project, recursive);
    let depsList: DependencyNode<AngularProjectData>[];

    if (cmd.sorted) {
      depsList = sorter.getSortedDependencies(depsTree);
    } else {
      depsList = depsTree.flatDistinctChildren(recursive);
    }

    Logger.logF`{green >} Found {green ${
      depsList.length
    }} dependencies for {yellow ${project}}${(depsList.length > 0 && ':') ||
      '.'} {green ${depsList.map(dep => dep.name).join(', ')}}`;
  }
};
