import Log from '../../util/Log';
import Master from './Master';

class MasterFactory {
  private static _instance: MasterFactory;

  private readonly _masterDict = new Map<string, Master>();

  private readonly _log = Log.getLog('MasterFactory', Log.ERROR);

  static createInstance(): MasterFactory {
    if (!this._instance) {
      this._instance = new MasterFactory();
    }
    return this._instance;
  }

  static destroyInstance(): void {
    this._instance.destroy();
    this._instance = null;
  }

  static register<T extends typeof Master>(masterClass: T | T[]): void {
    if (!Array.isArray(masterClass)) {
      masterClass = [masterClass];
    }
    masterClass.forEach((klass) => {
      const masterName = klass.masterName;
      if (this._instance._masterDict.has(masterName)) {
        this._instance._log.e(`${masterName} has already registered!`);
        return;
      }

      const instance = new klass();
      this._instance._masterDict.set(klass.masterName, instance);

      if (process.env.NODE_ENV === 'development') {
        window[`__master__${klass.masterName}`] = instance;
      }
    });
  }

  static get<T extends typeof Master>(masterClass: T | string): InstanceType<T> {
    let masterName: string;
    if (typeof masterClass === 'string') {
      masterName = masterClass;
    } else {
      masterName = masterClass.masterName;
    }

    if (!this._instance._masterDict.has(masterName)) {
      this._instance._log.e(`${masterName} not found!`);
      return null;
    }

    return this._instance._masterDict.get(masterName) as InstanceType<T>;
  }

  destroy() {
    this._masterDict.clear();
  }
}

export default MasterFactory;
