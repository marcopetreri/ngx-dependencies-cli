export type AngularProjectData = { [key: string]: any };

export type AngularProjectsMap = Map<string, AngularProjectData>;

export enum AngularProjectTypes {
  LIB = 'library',
  APP = 'application'
}

export interface AngularProjectFilters {
  type?: AngularProjectTypes;
  names?: string[];
}
