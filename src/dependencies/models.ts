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

  public getDependenciesNames(maxDepth?: number): string[] {
    return this._getUniqueNodesByName(this.getChildrenList(maxDepth)).map(node => node.name);
  }

  public getChildrenList(maxDepth?: number): DependencyNode<T>[] {
    return this._reduceChildren(
      (acc, [, node]) => {
        if (maxDepth != null && maxDepth === node.gen) {
          return acc;
        } else {
          acc.push(node);
          return acc.concat(node.getChildrenList(maxDepth));
        }
      },
      [] as DependencyNode<T>[]
    );
  }

  public toString(): string {
    return (
      `${this.gen} - ${this.name}
      Dependencies:
    ` + this._reduceChildren((acc, node) => acc + node.toString(), '')
    );
  }

  private _reduceChildren<S = [string, DependencyNode<T>]>(
    reduceFn: (acc: S, node: [string, DependencyNode<T>]) => S,
    acc?: S
  ): S {
    return [...this.children].reduce(reduceFn, acc);
  }

  // private _recurseNode(recurseFn , acc, maxDepth?: number) {
  //   return [...this.children]((acc, [name, node]) => {
  //     return maxDepth != null && maxDepth === node.gen ? acc this._reduceChildren(acc, node)
  //   }, acc);
  // }

  private _getUniqueNodesByName(nodes: DependencyNode<T>[]): DependencyNode<T>[] {
    return nodes.filter((node, i, a) => a.findIndex(_node => _node.name === node.name) === i);
  }
}
