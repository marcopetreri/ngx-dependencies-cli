# ngx-dependencies-cli

A ng-cli wrapper for managing Angular projects with local library projects as dependencies.

## Installation

Install it globally with `npm install -g ngx-dependencies-cli` and then `ngd` cli will be available to use in your Angular project.

## Documentation

In your Angular project root folder type `ngd [options] [command]`.

#### Options

```
-v, --version             output the version number
-d, --debug               output debug informations
-h, --help                output usage information
```

### Commands

```
build [project]           Builds [project] with its dependencies
list [options] [project]  Lists [project] dependencies
```

### Build

Builds `[project]` with its dependencies

#### Usage

`build [options] [project]`

#### Options

`-h, --help output usage information`

### List

Lists `[project]` dependencies

#### Usage

`list [options] [project]`

#### Options

```
-a, --affected            lists all projects affected by [project]
-s, --sorted              lists dependencies topologically sorted
-r, --recursive           applies recursive strategy to resolve the dependencies
-g, --generation [value]  stops the dependencies resolve to [value] generation
-h, --help                output usage information
```
