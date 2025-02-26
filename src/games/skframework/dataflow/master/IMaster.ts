import IRecord from '../record/IRecord';

interface IMaster<T, R extends IRecord<T>> {
  getAll(): R[];
  getById(id: T): R;

  store(records: R | R[]): void;
  update(record: R | R[]): void;
  remove(record: T | T[] | R | R[]): void;
}

export default IMaster;
