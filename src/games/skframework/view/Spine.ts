import { valueOrDefault } from '../util/Util';
import View, { IViewConfig } from './View';

export interface ISpineConfig extends IViewConfig {
  key: string;
  animationName?: string;
  loop?: boolean;
  spine?: string;
  autoPlay?: boolean;
}

export default class Spine extends View {
  static readonly typeName: string = 'Spine';

  private _spine: any;

  constructor(scene: Phaser.Scene, config: ISpineConfig, children?: Phaser.GameObjects.GameObject[]) {
    super(scene, config, children);

    this._spine = this.scene.add.spine(0, 0, config.key, config.animationName, config.loop);
    this.add(this._spine);

    Phaser.GameObjects.BuildGameObject(scene, this, config);

    if (!!config.autoPlay) {
      this.playAnimation(!!config.loop, config.animationName);
    } else {
      this._spine.setVisible(false);
    }
  }

  getAnimations(): Array<string> {
    return this._spine.getAnimationList();
  }

  set timeScale(timeScale: number) {
    this._spine.timeScale = timeScale;
  }

  get timeScale(): number {
    return this._spine.timeScale;
  }

  setTimeScale(timeScale: number): this {
    this._spine.timeScale = timeScale;
    return this;
  }

  playAnimation(loop: boolean, animationName?: string, delayTimeCallBack?: number, callback?: () => void) {
    this._spine.setVisible(true);
    this._spine.play(valueOrDefault(animationName, this.getAnimations()[0]), loop);
    if (callback) {
      if (!delayTimeCallBack) {
        this._spine.once('complete', () => {
          callback();
        });
      } else {
        this.scene.time.delayedCall(delayTimeCallBack, () => callback());
      }
    }
  }

  setSkeleton(atlasDataKey: string, animationName?: string, loop?: boolean, skeletonJSON?: object): this {
    this._spine.setSkeleton(atlasDataKey, animationName, loop, skeletonJSON);
    return this;
  }

  setAttachment(slotName: string, attachmentName: string): this {
    this._spine.setAttachment(slotName, attachmentName);
    return this;
  }

  getAttachmentByName(slotName: string, attachmentName: string) {
    return this._spine.getAttachmentByName(slotName, attachmentName);
  }

  findBone(name: string) {
    return this._spine.findBone(name);
  }

  findSlot(name: string) {
    return this._spine.findSlot(name);
  }

  setScale(x: number, y?: number): this {
    if (this._spine) {
      this._spine.scaleX = x;
      this._spine.scaleY = y ?? x;
    }
    return this;
  }
}
