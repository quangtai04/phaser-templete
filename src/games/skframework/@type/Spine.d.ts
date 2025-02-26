/* eslint-disable */
declare namespace Phaser.Loader {
  interface LoaderPlugin extends Phaser.Events.EventEmitter {
    spine(
      key: string | Phaser.Loader.FileTypes.SpineFileConfig | Phaser.Loader.FileTypes.SpineFileConfig[],
      jsonURL: string,
      atlasURL: string | string[],
      preMultipliedAlpha?: boolean,
      textureXhrSettings?: Phaser.Types.Loader.XHRSettingsObject,
      atlasXhrSettings?: Phaser.Types.Loader.XHRSettingsObject,
    ): LoaderPlugin;
  }
}

declare namespace Phaser.GameObjects {
  interface GameObjectFactory {
    spine(x: number, y: number, key?: string, animationName?: string, loop?: boolean): SpineGameObject;
    spineContainer(x: number, y: number, children?: SpineGameObject | SpineGameObject[]): SpineContainer;
  }
  interface GameObjectCreator {
    spine(config: SpineGameObjectConfig, addToScene?: boolean): SpineGameObject;
    spineContainer(config: SpineContainerConfig, addToScene?: boolean): SpineContainer;
  }
}

declare module 'phaser' {
  export = Phaser;
}
