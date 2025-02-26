declare interface NinePatch extends Phaser.GameObjects.RenderTexture {
  setTexture(key: string, baseFrame: string | Array<number>, columns: Array<number>, rows?: Array<number>): this;
}

declare namespace Phaser.GameObjects {
  // eslint-disable-next-line
  interface GameObjectFactory {
    rexNinePatch(config): NinePatch;
  }

  // eslint-disable-next-line
  interface GameObjectCreator {
    rexNinePatch(config): NinePatch;
  }
}

declare module 'phaser' {
  export = Phaser;
}
