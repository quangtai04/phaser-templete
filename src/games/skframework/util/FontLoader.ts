import { Observable, Subscriber } from 'rxjs';

interface FontItem {
  name: string;
  url: string;
}

class FontLoader {
  private _fontItems = new Array<FontItem>();
  private _concurrent: integer = 1;
  private _loadedCount: integer;

  constructor(concurrent: integer) {
    this._concurrent = Math.max(concurrent, 1);
  }

  get count(): integer {
    return this._fontItems.length;
  }

  add(name: string, url: string): void {
    this._fontItems.push({ name, url });
  }

  start(): Observable<number> {
    return new Observable((subscriber) => {
      if (this._fontItems.length > 0) {
        this._loadedCount = 0;
        this._start(subscriber)
          .then(() => subscriber.complete())
          .catch((err) => subscriber.error(err));
      } else {
        subscriber.complete();
      }
    });
  }

  async _start(subscriber: Subscriber<number>): Promise<void> {
    const groupCount = Math.floor(this._fontItems.length / this._concurrent);
    for (let group = 0; group < groupCount; group++) {
      const fromIndex = group * this._concurrent;
      const toIndex = fromIndex + this._concurrent;
      await this._loadGroup(fromIndex, toIndex, subscriber);
    }

    const fromIndex = groupCount * this._concurrent;
    const toIndex = this._fontItems.length;
    await this._loadGroup(fromIndex, toIndex, subscriber);
  }

  async _loadGroup(fromIndex: integer, toIndex: integer, subscriber: Subscriber<number>): Promise<void> {
    if (fromIndex < toIndex) {
      const tasks = new Array<Promise<void>>();
      for (let i = fromIndex; i < toIndex; i++) {
        const item = this._fontItems[i];
        tasks.push(this._loadOne(item, subscriber));
      }
      await Promise.all(tasks);
    }
  }

  _loadOne(item: FontItem, subscriber: Subscriber<number>): Promise<void> {
    return new Promise<void>((resolve) => {
      const fontFace = new FontFace(item.name, `url('${item.url}')`);
      fontFace
        .load()
        .then((font) => {
          document.fonts.add(font);

          this._loadedCount++;
          subscriber.next(this._loadedCount / this.count);

          resolve();
        })
        .catch((error) => {
          console.error(`Loading ${item.name} from ${item.url} got error`, error);
          resolve();
        });
    });
  }
}

export default FontLoader;
