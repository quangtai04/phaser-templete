import { Subscription } from 'rxjs';
import ILifetimeSubscription from '../core/ILifetimeSubscription';
import { deepCopy } from '../util/Util';
import { IImageConfig } from './Image';

export interface ISize {
  width: number;
  height: number;
}

export interface IVector2 {
  x: number;
  y: number;
}

export interface IViewConfig {
  type?: string;
  name?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  scale?: number | IVector2;
  rotation?: number;
  angle?: number;
  alpha?: number;
  visible?: boolean;
  displaySize?: ISize;
  children?: IViewConfig[] | IImageConfig[];
}

export default class View extends Phaser.GameObjects.Container implements ILifetimeSubscription {
  static readonly typeName: string = 'View';

  readonly layoutConfig: IViewConfig;

  readonly subscription = new Subscription();

  constructor(scene: Phaser.Scene, config: IViewConfig, children?: Phaser.GameObjects.GameObject[]) {
    super(scene, config.x, config.y, children);

    this.layoutConfig = deepCopy(config);

    Phaser.GameObjects.BuildGameObject(scene, this, config);

    if (config.name) {
      this.setName(config.name);
    }
    if (config.width && config.height) {
      this.setSize(config.width, config.height);
    }
    if (config.displaySize) {
      this.setDisplaySize(config.displaySize.width, config.displaySize.height);
    }
    if (config.visible !== undefined) {
      this.setVisible(config.visible);
    }
  }

  getByName<T extends Phaser.GameObjects.GameObject>(key: string): T {
    const names = key.split('/');

    let view: Phaser.GameObjects.GameObject = super.getByName(names[0]);
    if (!view) {
      return null;
    }

    for (let i = 1; i < names.length; i++) {
      if (view instanceof Phaser.GameObjects.Container) {
        view = view.getByName(names[i]);
        if (!view) {
          return null;
        }
      } else {
        return null;
      }
    }

    return view as T;
  }

  layout(): void {
    this.getAll().forEach((go) => {
      if (go instanceof View) {
        go.layout();
      }
    });
  }

  destroy(fromScene?: boolean): void {
    this.subscription.unsubscribe();

    super.destroy(fromScene);
  }
}
