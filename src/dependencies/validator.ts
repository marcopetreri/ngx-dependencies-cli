import { PathsMap, DependenciesMap } from './models';

export default class DependencyValidator {
  constructor() {}

  public getProjectValidatedDependencies(
    imports: string[],
    validateFn: (path: string) => boolean
  ): string[] {
    return imports.filter(validateFn);
  }
}
