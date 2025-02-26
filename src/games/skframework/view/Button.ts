import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js';
import { Observable, Subject } from 'rxjs';
import { convertColor, deepCopy } from '../util/Util';
import Image from './Image';
import Text from './Text';
import View, { IViewConfig } from './View';
import SoundManager from '../sound/SoundManager';

export interface IButtonStateConfig {
  key?: string;
  color?: string;
  scale?: number | 'no-change';
  // ninePatch
  columns?: (number | null)[];
  rows?: (number | null)[];
}

export interface IButtonConfig extends IViewConfig {
  normalConfig?: IButtonStateConfig;
  hoverConfig?: IButtonStateConfig;
  pressedConfig?: IButtonStateConfig;
  disabledConfig?: IButtonStateConfig;

  se?: string;
  enabled?: boolean;
  interactable?: boolean;

  rectangle?: string;
  image?: string;
  text?: string;
  ninePatch?: string;

  cursor?: string;
}

export default class Button extends View {
  static readonly typeName: string = 'Button';

  protected _normalConfig: IButtonStateConfig;
  protected _hoverConfig: IButtonStateConfig;
  protected _pressedConfig: IButtonStateConfig;
  protected _disabledConfig: IButtonStateConfig;
  private _soundKey: string;
  protected _se: string;
  protected _enabled: boolean = true;
  protected _interactable: boolean = true;

  protected _rectangleObject: RoundRectangle;
  protected _imageObject: Image;
  protected _textObject: Text;
  protected _ninePatchObject: NinePatch;

  protected _offOverSubject: boolean = false;
  protected _offOutSubject: boolean = false;

  protected _clickSubject = new Subject<this>();
  protected _pointeroverSubject = new Subject<this>();
  protected _pointeroutSubject = new Subject<this>();

  protected _config: IButtonConfig;

  get texture(): string {
    return this._normalConfig.key;
  }

  get normalConfig(): IButtonStateConfig {
    return this._normalConfig;
  }

  get hoverConfig(): IButtonStateConfig {
    return this._hoverConfig;
  }

  get pressedConfig(): IButtonStateConfig {
    return this._pressedConfig;
  }

  constructor(scene: Phaser.Scene, config: IButtonConfig, children?: Phaser.GameObjects.GameObject[]) {
    super(scene, config, children);

    this._config = config;

    Phaser.GameObjects.BuildGameObject(scene, this, config);

    this._normalConfig = deepCopy(config.normalConfig);
    this._hoverConfig = deepCopy(config.hoverConfig);
    this._pressedConfig = deepCopy(config.pressedConfig);
    this._disabledConfig = deepCopy(config.disabledConfig);

    this._se = config.se;

    if (config.rectangle) {
      this._rectangleObject = this.getByName(config.rectangle);
    }
    if (config.image) {
      this._imageObject = this.getByName(config.image);
    }
    if (config.text) {
      this._textObject = this.getByName(config.text);
    }
    if (config.ninePatch) {
      this._ninePatchObject = this.getByName(config.ninePatch);
    }

    if (config.name) {
      this.setName(config.name);
    }
    if (config.displaySize) {
      this.setDisplaySize(config.displaySize.width, config.displaySize.height);
    }

    this._enabled = config.enabled ?? true;
    this._interactable = config.interactable ?? true;
    if (this._enabled) {
      this._setStateConfig(this._normalConfig);
    } else {
      this._setStateConfig(this._disabledConfig);
    }

    if (this.width === 0 && this.height === 0) {
      const bounds = this.getBounds();
      this.setSize(bounds.width, bounds.height);
    }

    this.setInteractive(this._config?.cursor ? { cursor: this._config?.cursor } : { useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_OVER, () => this._onPointerOver())
      .on(Phaser.Input.Events.POINTER_DOWN, () => this._onPointerDown())
      .on(Phaser.Input.Events.POINTER_OUT, () => this._onPointerOut());
    if (!this._interactable) this.disableInteractive();
  }

  protected _onPointerOver(): void {
    if (this._offOverSubject) return;
    this._pointeroverSubject.next(this);
    if (!this._hoverConfig) {
      return;
    }
    this._setStateConfig(this._hoverConfig);
  }

  protected _onPointerDown(): void {
    this._setStateConfig(this._pressedConfig);

    if (this._se) {
      SoundManager.sfx(this._soundKey ?? this._se);
    }

    this._clickSubject.next(this);
  }

  protected _onPointerOut(): void {
    if (this._offOutSubject) return;
    this._setStateConfig(this._enabled ? this._normalConfig : this._disabledConfig);
    this._pointeroutSubject.next(this);
  }

  setInteractive(
    shape?: Phaser.Types.Input.InputConfiguration | any,
    callback?: Phaser.Types.Input.HitAreaCallback,
    dropZone?: boolean,
  ): this {
    super.setInteractive(shape, callback, dropZone);

    this._enabled = true;
    this._setStateConfig(this._normalConfig);
    return this;
  }

  disableInteractive(): this {
    super.disableInteractive();

    this._enabled = false;
    this._setStateConfig(this._disabledConfig);
    return this;
  }

  setEnabled(enabled: boolean): this {
    return enabled ? this.setInteractive() : this.disableInteractive();
  }

  setText(text: string): this {
    if (this._textObject) {
      this._textObject.setText(text);
    }
    return this;
  }

  setTextColor(color: string): this {
    if (this._textObject) {
      this._textObject.setColor(color);
    }
    return this;
  }

  setTexture(nornalKey: string, hoverKey?: string, pressedKey?: string, disabledKey?: string): this {
    if (this._normalConfig) {
      this._normalConfig.key = nornalKey;
    } else {
      this._normalConfig = { key: nornalKey };
    }
    if (hoverKey) {
      if (this._hoverConfig) {
        this._hoverConfig.key = hoverKey;
      } else {
        this._hoverConfig = { key: hoverKey };
      }
    }
    if (pressedKey) {
      if (this._pressedConfig) {
        this._pressedConfig.key = pressedKey;
      } else {
        this._pressedConfig = { key: pressedKey };
      }
    }
    if (disabledKey) {
      if (this._disabledConfig) {
        this._disabledConfig.key = disabledKey;
      } else {
        this._disabledConfig = { key: disabledKey };
      }
    }

    if (this._imageObject) {
      if (this._enabled) {
        this._imageObject.setTexture(nornalKey);
      } else if (!this._enabled && disabledKey) {
        this._imageObject.setTexture(disabledKey);
      }
    }

    if (this._ninePatchObject) {
      if (this._enabled) {
        this._setStateConfig(this._normalConfig);
      } else if (!this._enabled && disabledKey) {
        this._setStateConfig(this._disabledConfig);
      }
    }

    return this;
  }

  onClickAsObserable(): Observable<this> {
    return this._clickSubject;
  }
  onPointeroverAsObserable(): Observable<this> {
    return this._pointeroverSubject;
  }
  onPointeroutAsObserable(): Observable<this> {
    return this._pointeroutSubject;
  }

  set offOverSubject(value: boolean) {
    this._offOverSubject = value;
  }
  set offOutSubject(value: boolean) {
    this._offOutSubject = value;
  }
  get offOverSubject(): boolean {
    return this._offOverSubject;
  }
  get offOutSubject(): boolean {
    return this._offOutSubject;
  }
  setOffOverSubject(value: boolean): this {
    this._offOverSubject = value;
    return this;
  }
  setOffOutSubject(value: boolean): this {
    this._offOutSubject = value;
    return this;
  }

  setDisabledTexture(key: string): this {
    this._disabledConfig.key = key;
    if (!this._enabled) {
      this._setStateConfig(this._disabledConfig);
    }
    return this;
  }

  protected _setStateConfig(config: IButtonStateConfig): void {
    if (this._rectangleObject && config?.color) {
      this._rectangleObject.setFillStyle(convertColor(config.color));
    }
    if (this._imageObject) {
      if (config?.key) {
        this._imageObject.setTexture(config.key);
      }
      if (config?.color) {
        this._imageObject.setTint(convertColor(config.color));
      } else if (config?.color === '') {
        this._imageObject.clearTint();
      }
    }
    if (this._textObject && config?.color) {
      this._textObject.setColor(config.color);
    }
    if (this._ninePatchObject) {
      const columns = (this._ninePatchObject as any).columns.data;
      const rows = (this._ninePatchObject as any).rows.data;
      const textureKey = (this._ninePatchObject as any).textureKey;
      this._ninePatchObject.setTexture(
        config?.key ?? textureKey,
        (config?.columns ?? columns).map((t) => t ?? undefined),
        (config?.rows ?? rows).map((t) => t ?? undefined),
      );
    }
    if (config?.scale === 'no-change') {
      return;
    }
    const scaleX = config?.scale ?? 1;
    const scaleY = config?.scale ?? 1;
    // if (scaleX !== this.scaleX || scaleY !== this.scaleY) {
    this.scene.tweens.add({
      targets: this,
      scaleX: scaleX,
      scaleY: scaleY,
      duration: 100,
    });
    // }
  }

  setImagePixcelPerfect(): this {
    this.disableInteractive();
    this._enabled = true;
    this._imageObject
      .setInteractive({ pixelPerfect: true, useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_OVER, () => this._onPointerOver())
      .on(Phaser.Input.Events.POINTER_DOWN, () => this._onPointerDown())
      .on(Phaser.Input.Events.POINTER_OUT, () => this._onPointerOut());
    return this;
  }

  setNinePatchInteractive(): this {
    this.disableInteractive();
    this._ninePatchObject
      .setInteractive(this._config?.cursor ? { cursor: this._config?.cursor } : { useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_OVER, () => this._onPointerOver())
      .on(Phaser.Input.Events.POINTER_DOWN, () => this._onPointerDown())
      .on(Phaser.Input.Events.POINTER_OUT, () => this._onPointerOut());
    return this;
  }

  setSizeNinePatch(width: number, height: number): this {
    if (this._ninePatchObject) {
      this._ninePatchObject.setSize(width, height);
    }
    return this;
  }

  setEnabledImageObj(enabled: boolean): this {
    enabled ? this._imageObject.setInteractive() : this._imageObject.disableInteractive();
    return this;
  }

  setEnabledNinePatchObj(enabled: boolean): this {
    enabled ? this._ninePatchObject.setInteractive() : this._ninePatchObject.disableInteractive();
    return this;
  }

  set soundKey(value: string) {
    this._soundKey = value;
  }

  setTintColorImageObj(color?: string): this {
    if (color) this._imageObject?.setTint(convertColor(color));
    else this._imageObject?.clearTint();
    return this;
  }
  get config(): IButtonConfig {
    return this._config;
  }
  get sizeNinePatch(): { width: number; height: number } {
    return { width: this._ninePatchObject?.width ?? 0, height: this._ninePatchObject?.height ?? 0 };
  }
}
