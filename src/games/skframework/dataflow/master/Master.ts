import Log from '../../util/Log';
import IRecord from '../record/IRecord';
import IMaster from './IMaster';

class Master {
  static readonly masterName: string = null;

  store(records: any): void {
    throw new Error('Method not implemented.');
  }
}

export abstract class MasterBase<T, R extends IRecord<T>> extends Master implements IMaster<T, R> {
  private readonly _data = new Array<R>();
  private readonly _dictById = new Map<T, R>();

  private readonly _log = Log.getLog('Master', Log.ERROR);

  getAll(): R[] {
    return this._data;
  }

  getById(id: T): R {
    return this._dictById.get(id);
  }

  store(records: R | R[]): void {
    if (!records) {
      return;
    }

    if (Array.isArray(records)) {
      records.forEach((record) => {
        this._storeOne(record);
      });
    } else {
      this._storeOne(records);
    }
  }

  update(records: R | R[]): void {
    if (Array.isArray(records)) {
      records.forEach((record) => {
        this._updateOne(record);
      });
    } else {
      this._updateOne(records);
    }
  }

  remove(records: T | T[] | R | R[]): void {
    if (Array.isArray(records)) {
      records.forEach((record: R | T) => {
        this._removeOne(record);
      });
    } else {
      this._removeOne(records);
    }
  }
  removeRecord(records: R | R[]): void {
    if (Array.isArray(records)) {
      records.forEach((record) => {
        this._removeRecord(record);
      });
    } else {
      this._removeRecord(records);
    }
  }

  removeAll(): void {
    this._data.splice(0, this._data.length);
    this._dictById.clear();
  }

  private _storeOne(record: R): void {
    const id = record.id;
    if (this._dictById.has(id)) {
      this._log.e(`ID=${id} is duplicated!`);
      return;
    }

    this._data.push(record);
    this._dictById.set(id, record);
  }

  private _updateOne(record: R): void {
    const id = record.id;
    const index = this._data.findIndex((r) => r.id === id);
    if (index >= 0) {
      this._data.splice(index, 1, record);
    } else {
      this._data.push(record);
    }
    this._dictById.set(id, record);
  }

  private _removeOne(record: T | R): void {
    const r = record as R;
    const id = r != null ? r.id : (record as T);

    const index = this._data.findIndex((r) => r.id === id);
    if (index > 0) {
      this._data.splice(index, 1);
    }
    this._dictById.delete(id);
  }
  private _removeRecord(record: R): void {
    const index = this._data.findIndex((r) => r.id === record.id);
    if (index >= 0) {
      this._data.splice(index, 1);
    }
    this._dictById.delete(record.id);
  }

  toCsv(): string {
    if (this._data.length <= 0) {
      return null;
    }

    const propertyNames = Object.getOwnPropertyNames(this._data[0]);
    const body = this._data.map((r) => propertyNames.map((propertyName) => r[propertyName] ?? '').join(','));

    return [propertyNames.join(','), ...body].join('\n');
  }
}

export default Master;
