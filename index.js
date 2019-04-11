function projectIsLibrary(project) {
  return project.projectType === 'library';
}

function projectIsLibraryFilterFn([, projectData]) {
  return projectIsLibrary(projectData);
}

const dtree = require('dependency-tree'),
  angular = require('./angular.json'),
  tsConfig = require('./tsconfig.json');

const projects = Object.entries(angular.projects).filter(
  projectIsLibraryFilterFn
);

const projectsNames = projects.map(([projectName]) => projectName);

const dependencies = projects.map(([projectName, projectData]) => {
  const projectPath = './' + projectData.root;

  return [
    projectName,
    dtree
      .toList({
        filename: projectPath + '/src/public_api.ts',
        directory: projectPath,
        tsConfig: tsConfig,
        filter: path => {
          return path.indexOf('node_modules') === -1;
        }
      })
      .filter(path => path.indexOf('dist') > -1)
      .map(path =>
        projectsNames.find(_projectName => path.indexOf(_projectName) > -1)
      )
      .filter(
        (path, i, paths) => paths.findIndex(_path => _path === path) === i
      )
  ];
});

const dependenciesMap = new Map(dependencies);

console.dir(dependenciesMap, { depth: null });

// module.exports =
