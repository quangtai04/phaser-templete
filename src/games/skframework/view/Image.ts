import Log from '../util/Log';
import { deepCopy } from '../util/Util';
import { IVector2, IViewConfig } from './View';

export enum Aspect {
  NONE,
  MATCH_WIDTH,
  MATCH_HEIGHT,
  FIT,
  ENVELOPE,
}

export interface IImageConfig extends IViewConfig {
  key?: string;
  frame?: string;
  origin?: IVector2;
  aspect?: Aspect;
  config?: any;
}

export default class Image extends Phaser.GameObjects.Image {
  private static _log = Log.getLog('Image', Log.ERROR);

  readonly layoutConfig: IImageConfig;

  private _aspect: Aspect = Aspect.NONE;
  private _originalWidth: number;
  private _originalHeight: number;

  constructor(scene: Phaser.Scene, config: IImageConfig) {
    super(scene, config.x, config.y, config.key, config.frame);

    this.layoutConfig = deepCopy(config);

    Phaser.GameObjects.BuildGameObject(scene, this, config);

    if (config.name) {
      this.setName(config.name);
    }
    if (config.displaySize) {
      this.setDisplaySize(config.displaySize.width, config.displaySize.height);
    }

    this._aspect = config.aspect ?? Aspect.NONE;
    this._originalWidth = config.width ?? this.width;
    this._originalHeight = config.height ?? this.height;

    this._applyAspect(config.key, config.frame);
  }

  setTexture(key: string, frame?: string | number): this {
    if (key && !this.scene.textures.getFrame(key, frame)) {
      Image._log.e(`Image not found! key=${key} frame=${frame}`);
    }

    super.setTexture(key, frame);

    this._applyAspect(key, frame);

    return this;
  }

  private _applyAspect(key: string, frame?: string | number): void {
    if (!key) {
      return;
    }

    const f = this.scene.textures.getFrame(key, frame);
    if (!f) {
      return;
    }

    const { width, height } = f;
    switch (this._aspect) {
      case Aspect.MATCH_WIDTH:
        {
          const ratio = this._originalWidth / width;
          this.setDisplaySize(this._originalWidth, height * ratio);
        }
        break;

      case Aspect.MATCH_HEIGHT:
        {
          const ratio = this._originalHeight / height;
          this.setDisplaySize(width * ratio, this._originalHeight);
        }
        break;

      case Aspect.FIT:
        {
          const ratio = Math.min(this._originalWidth / width, this._originalHeight / height);
          this.setDisplaySize(width * ratio, height * ratio);
        }
        break;

      case Aspect.ENVELOPE:
        {
          const ratio = Math.max(this._originalWidth / width, this._originalHeight / height);
          this.setDisplaySize(width * ratio, height * ratio);
        }
        break;
    }
  }
  get config(): any {
    return this.layoutConfig.config;
  }
}
