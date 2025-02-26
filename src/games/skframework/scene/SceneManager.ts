import Game from '../Game';
import Log from '../util/Log';
import ISceneParam from './ISceneParam';
import Scene from './Scene';

class SceneManager {
  private static _instance: SceneManager;

  static createInstance(game: Game): SceneManager {
    if (!this._instance) {
      this._instance = new SceneManager(game);
    }
    return this._instance;
  }

  static destroyInstance(): void {
    this._instance.destroy();
    this._instance = null;
  }

  static getCurrentScene(): Phaser.Scene {
    const instance = this._instance;
    let identifier = instance._sceneStack[instance._sceneStack.length - 1];
    return instance._game.scene.getScene(identifier);
  }

  static getSceneByIdentifier(identifier: string): Phaser.Scene {
    const instance = this._instance;
    return instance._game.scene.getScene(identifier);
  }

  static swapScene<T_A extends typeof Scene, T_B extends typeof Scene>(sceneClassA: T_A, sceneClassB: T_B): void {
    const instance = this._instance;
    if (
      instance._game.scene.getScene(sceneClassA.identifier) &&
      instance._game.scene.getScene(sceneClassB.identifier)
    ) {
      let indexA = instance._sceneStack.indexOf(sceneClassA.identifier);
      let indexB = instance._sceneStack.indexOf(sceneClassB.identifier);
      let _temp = instance._sceneStack[indexA];
      instance._sceneStack[indexA] = instance._sceneStack[indexB];
      instance._sceneStack[indexB] = _temp;
      instance._game.scene.swapPosition(sceneClassA.identifier, sceneClassB.identifier);
    } else {
      instance._log.d('swapScene rejected', sceneClassA.identifier, sceneClassB.identifier);
    }
  }

  static startScene<T extends typeof Scene>(sceneClass: T, param?: ISceneParam, skipCheckProcessing?: boolean): void {
    const instance = this._instance;

    if (instance._game.scene.isProcessing && !skipCheckProcessing) {
      instance._log.d('startScene rejected', sceneClass.identifier);
      return;
    }

    if (instance._game.scene.getScene(sceneClass.identifier)) {
      instance._game.scene.start(sceneClass.identifier, param);
    } else {
      instance._game.scene.add(sceneClass.identifier, sceneClass, true, param);
    }
    instance._sceneStack.push(sceneClass.identifier);
  }

  static pushScene<T extends typeof Scene>(sceneClass: T, param?: ISceneParam): void {
    const instance = this._instance;

    if (instance._sceneStack.length > 0) {
      const identifier = instance._sceneStack[instance._sceneStack.length - 1];
      instance._game.scene.pause(identifier);
    }
    instance._sceneStack.push(sceneClass.identifier);
    instance._game.scene.add(sceneClass.identifier, sceneClass, true, param);
  }

  static popScene(): void {
    const instance = this._instance;

    if (instance._game.scene.isProcessing || instance._sceneStack.length <= 1) {
      instance._log.d('popScene rejected');
      return;
    }

    let identifier = instance._sceneStack[instance._sceneStack.length - 1];
    instance._game.scene.remove(identifier);
    instance._sceneStack.pop();

    identifier = instance._sceneStack[instance._sceneStack.length - 1];
    instance._game.scene.resume(identifier);
  }

  static removeScene(identifier: string): void {
    const instance = this._instance;

    if (
      instance._game.scene.isProcessing ||
      instance._sceneStack.length <= 1 ||
      !instance._sceneStack.includes(identifier)
    ) {
      instance._log.d('removeScene rejected', identifier);
      return;
    }

    instance._game.scene.remove(identifier);
    instance._sceneStack.slice(instance._sceneStack.indexOf(identifier), 1);
  }

  static replaceScene<T extends typeof Scene>(sceneClass: T, param?: ISceneParam): void {
    const instance = this._instance;

    if (instance._sceneStack.length > 0) {
      const identifier = instance._sceneStack[instance._sceneStack.length - 1];
      instance._game.scene.remove(identifier);
      instance._sceneStack.pop();
    }
    instance._sceneStack.push(sceneClass.identifier);
    instance._game.scene.add(sceneClass.identifier, sceneClass, true, param);
  }

  static sleepScene<T extends typeof Scene>(sceneClass: T): void {
    const instance = this._instance;

    if (instance._game.scene.isProcessing) {
      instance._log.d('sleepScene rejected', sceneClass.identifier);
      return;
    }

    instance._game.scene.sleep(sceneClass.identifier);
  }

  private readonly _game: Game;

  private readonly _log = Log.getLog('SceneManager', Log.DEBUG);

  private readonly _sceneStack = new Array<string>();

  constructor(game: Game) {
    this._game = game;
  }

  destroy(): void {
    this._sceneStack.splice(0, this._sceneStack.length);
  }
}

export default SceneManager;
