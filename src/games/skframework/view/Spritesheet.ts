import View, { IViewConfig } from './View';

export interface ISpritesheetConfig extends IViewConfig {
  key: string;
  default?: {
    animationName: string;
    config?: Phaser.Types.Animations.GenerateFrameNumbers;
    frameRate?: number;
    repeat?: number;
  };
  animations?: {
    animationName: string;
    config?: Phaser.Types.Animations.GenerateFrameNumbers;
    frameRate?: number;
    repeat?: number;
  }[];
}

export default class Spritesheet extends View {
  static readonly typeName: string = 'Spritesheet';

  private _config: ISpritesheetConfig;
  private _spritesheet: Phaser.GameObjects.Sprite;
  private _animation: {
    [key: string]: boolean | Phaser.Animations.Animation;
  } = {};

  constructor(scene: Phaser.Scene, config: ISpritesheetConfig, children?: Phaser.GameObjects.GameObject[]) {
    super(scene, config, children);
    this._config = config;
    this._spritesheet = this.scene.add.sprite(0, 0, config.key).setVisible(false);
    this.add(this._spritesheet);
    if (config.default) {
      this.addAnimation({ ...config.default });
      this.show();
      this._spritesheet.play(config?.default?.animationName);
    }
    config.animations?.forEach((animation) => this.addAnimation({ ...animation }));
    Phaser.GameObjects.BuildGameObject(scene, this, config);
  }
  addAnimation(config?: {
    animationName: string;
    config?: Phaser.Types.Animations.GenerateFrameNumbers;
    frameRate?: number;
    repeat?: number;
  }) {
    let key_animtion = config?.animationName ?? this._config.key;
    this._animation[key_animtion] = this.scene.anims.create({
      key: key_animtion,
      frames: this.scene.anims.generateFrameNumbers(this._config.key, config?.config ?? {}),
      frameRate: config?.frameRate,
      repeat: config?.repeat ?? 0,
    });
  }
  play(animationName?: string): this {
    this.show();
    this._spritesheet.play(animationName ?? this._config.key);
    return this;
  }
  stop(): this {
    this._spritesheet.anims.stop();
    return this;
  }
  hide(): this {
    this._spritesheet.setVisible(false);
    return this;
  }
  show(): this {
    this._spritesheet.setVisible(true);
    return this;
  }
}
