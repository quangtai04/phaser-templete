import { deepCopy } from '../util/Util';
import Button, { IButtonConfig, IButtonStateConfig } from './Button';

export interface IToggleConfig extends IButtonConfig {
  toggledConfig?: IButtonStateConfig;
}

export default class Toggle extends Button {
  static readonly typeName: string = 'Toggle';

  private _toggledConfig: IButtonStateConfig;

  private _toggled: boolean = false;

  constructor(scene: Phaser.Scene, config: IToggleConfig, children?: Phaser.GameObjects.GameObject[]) {
    super(scene, config, children);

    Phaser.GameObjects.BuildGameObject(scene, this, config);

    this._toggledConfig = deepCopy(config.toggledConfig);
  }

  getToggled(): boolean {
    return this._toggled;
  }

  setToggled(toggled: boolean): this {
    this._toggled = toggled;

    return this;
  }
}
