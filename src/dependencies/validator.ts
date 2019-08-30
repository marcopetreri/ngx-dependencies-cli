import { Angular } from '../angular';

export default class DependencyValidator {
  constructor(private _ng: Angular) {}

  public getValidatedProjects(projects: string[]): string[] {
    return projects.filter(this._ng.getProjectValidatorFn());
  }
}
