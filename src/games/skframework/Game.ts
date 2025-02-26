import "./extension/Subscription";
import MasterFactory from "./dataflow/master/MasterFactory";
import SceneManager from "./scene/SceneManager";
import Log from "./util/Log";
import LayoutFactory from "./view/LayoutFactory";
import Text from "./view/Text";
import SoundManager from "./sound/SoundManager";
import { SpineScene } from "./scene/SpineScene";

export interface GameConfig extends Phaser.Types.Core.GameConfig {
  soundManagerClass?: typeof SoundManager;
}

abstract class Game extends Phaser.Game {
  protected log = Log.getLog("Game", Log.DEBUG);

  constructor(gameData: object, gameConfig: GameConfig) {
    super({
      autoFocus: true,
      scene: [SpineScene],
      // loader: {
      //   baseURL: getBaseURL(),
      // },
      type: Phaser.CANVAS,
      ...gameConfig,
    });

    this.log.i("creating...");

    SoundManager.createInstance(gameConfig.soundManagerClass ?? SoundManager);
    SceneManager.createInstance(this);
    MasterFactory.createInstance();
    LayoutFactory.createInstance();

    this.registerFactory();
    this.loadMasterData(gameData);
  }

  protected registerFactory(): void {}
  protected loadMasterData(gameData: object): void {}

  destroy(removeCanvas: boolean, noReturn?: boolean): void {
    LayoutFactory.destroyInstance();
    MasterFactory.destroyInstance();
    SceneManager.destroyInstance();
    SoundManager.destroyInstance();

    Text.clearTextMetrics();

    super.destroy(removeCanvas, noReturn);

    this.log.i("destroyed.");
  }
}

export default Game;
