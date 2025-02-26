export default class Pool<V> {
  private readonly _createFn: () => V;
  private readonly _getFn: (object: V) => void;
  private readonly _saveFn: (object: V) => void;

  private readonly _list = new Array<V>();

  constructor(createFn: () => V, getFn: (object: V) => void, saveFn: (object: V) => void) {
    this._createFn = createFn;
    this._getFn = getFn;
    this._saveFn = saveFn;
  }

  get(): V {
    const object = this._list.pop() ?? this._createFn();
    this._getFn(object);
    return object;
  }

  save(...objects: V[]): void {
    objects.forEach((object) => {
      this._saveFn(object);
      this._list.push(object);
    });
  }
}
