import { Subscription } from 'rxjs';

import IScene from './IScene';
import ISceneParam from './ISceneParam';
import ViewModel from './ViewModel';

export abstract class Scene extends Phaser.Scene implements IScene {
  readonly subscription = new Subscription();

  static readonly identifier = null;

  init(param: ISceneParam): void {
    this.events.on(Phaser.Scenes.Events.DESTROY, this.destroy, this);
  }

  destroy(): void {
    // FIXME This is a work-around that skips the exception occurred when window is resizing.
    // This should be checked and removed when we upgrade to the latest Phaser.
    this.game.scale.removeAllListeners('resize');

    this.subscription.unsubscribe();
    this.game.scale.removeAllListeners('resize');
  }
}

export abstract class SceneWithParam<P extends ISceneParam> extends Scene {
  init(param: P): void {
    super.init(param);
  }

  create(param: P): void {}
}

export abstract class SceneWithParamAndViewModel<P extends ISceneParam, VM extends ViewModel> extends SceneWithParam<
  P
> {
  protected abstract readonly viewModel: VM;
}

export default Scene;
