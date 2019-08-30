import Logger from '../logger';

export type PathsMap = Map<string, string[]>;

export type DependenciesMap<T> = Map<string, DependencyNode<T>>;

export class DependencyNode<T = null> {
  public gen: number;

  constructor(
    public name: string,
    public children: DependenciesMap<T>,
    public readonly data?: T,
    public parent?: DependencyNode<T>
  ) {
    this.gen = (parent && parent.gen + 1) || 0;
  }

  public get childrenEntries(): [string, DependencyNode<T>][] {
    return [...this.children];
  }

  public get childrenNames(): string[] {
    return this.childrenEntries.map(([name]) => name);
  }

  public get childrenAsObject(): { [key: string]: any } {
    return this.childrenEntries.reduce((acc, [name, node]) => {
      acc[name] = node.childrenAsObject;
      return acc;
    }, {});
  }

  public flatDistinctChildren(maxDepth?: number): DependencyNode<T>[] {
    return this.flatChildren(maxDepth).filter(this._getDistinctFilterFn());
  }

  public flatChildren(maxDepth?: number): DependencyNode<T>[] {
    return this.childrenEntries.reduce(
      (acc, [, node]) => {
        if (maxDepth != null && maxDepth === node.gen) {
          return acc;
        } else {
          acc.push(node);
          return acc.concat(node.flatChildren(maxDepth));
        }
      },
      [] as DependencyNode<T>[]
    );
  }

  public traverseChildren(
    fn: (node: DependencyNode<T>, name: string) => void,
    maxDepth?: number
  ): void {
    this.childrenEntries.forEach(([name, node]) => {
      if (maxDepth != null && maxDepth === node.gen) {
        return;
      }
      fn(node, name);
      node.traverseChildren(fn, maxDepth);
    });
  }

  public toString(): string {
    return `${this.name}
${Logger.tree(this.childrenAsObject, true)}`;
  }

  private _getDistinctFilterFn(): (
    node: DependencyNode<T>,
    i: number,
    a: DependencyNode<T>[]
  ) => boolean {
    return (node, i, a) => a.findIndex(_node => _node.name === node.name) === i;
  }
}
