import RoundRectangle from "phaser3-rex-plugins/plugins/roundrectangle.js";

import Log from "../util/Log";
import { convertColor, valueOrDefault } from "../util/Util";
import Button from "./Button";
import Image, { IImageConfig } from "./Image";
import Text, { ITextConfig } from "./Text";
import View, { IVector2, IViewConfig } from "./View";
import Spine, { ISpineConfig } from "./Spine";
import Spritesheet, { ISpritesheetConfig } from "./Spritesheet";

export interface INinePatchConfig extends IImageConfig {
  baseFrame?: string;
  rows: number[];
  columns: number[];
}

export interface IRectangleConfig extends IViewConfig {
  origin?: IVector2;
  radius?:
    | number
    | {
        x: number;
        y: number;
      }
    | { tl: number; tr: number; bl: number; br: number }
    | {
        tl: { x: number; y: number };
        tr: { x: number; y: number };
        bl: { x: number; y: number };
        br: { x: number; y: number };
      };
  color?: string;
  stroke?: {
    alpha?: number;
    color?: string;
    thickness?: number;
  };
  rect_alpha?: number;
  useHandCursor?: boolean;
}
export interface ITriangleConfig extends IViewConfig {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  color?: string;
  stroke?: {
    color?: string;
    thickness?: number;
    alpha?: number;
  };
}
export interface ICircleConfig extends IViewConfig {
  radius: number;
  color?: string;
  startAngle?: number;
  endAngle?: number;
  anticlockwise?: boolean;
  stroke?: {
    alpha?: number;
    color?: string;
    thickness?: number;
  };
}

export interface IPrefabConfig extends IViewConfig {
  key: string;
}

class LayoutFactory {
  private static _instance: LayoutFactory;

  static createInstance(): LayoutFactory {
    if (!this._instance) {
      this._instance = new LayoutFactory();
    }
    return this._instance;
  }

  static destroyInstance(): void {
    this._instance.destroy();
    this._instance = null;
  }

  static register<T extends typeof View>(layoutClass: T | T[]): void {
    const instance = this._instance;

    if (!Array.isArray(layoutClass)) {
      layoutClass = [layoutClass];
    }
    layoutClass.forEach((klass) => {
      const typeName = klass.typeName;
      if (instance._viewTypes.has(typeName)) {
        instance._log.e(`${typeName} has already registered!`);
        return;
      }

      instance._viewTypes.set(typeName, klass);
    });
  }

  private static get(typeName: string): typeof View {
    const instance = this._instance;

    if (!instance._viewTypes.has(typeName)) {
      instance._log.e(`typeName=${typeName} not found!`);
      return null;
    }

    return instance._viewTypes.get(typeName);
  }

  static createView<T extends View>(
    scene: Phaser.Scene,
    config: IViewConfig | string
  ): T {
    let viewConfig: IViewConfig;
    if (typeof config === "string") {
      if (!scene.cache.json.exists(config)) {
        this._instance._log.e(`key=${config} not found!`);
        return null;
      }
      viewConfig = scene.cache.json.get(config);
    } else {
      viewConfig = config;
    }
    const type = viewConfig.type;
    const klass = this.get(type);

    const children = this.createChildren(scene, viewConfig.children);
    const layoutView = new klass(scene, viewConfig, children) as T;

    return layoutView;
  }

  static createChildren(
    scene: Phaser.Scene,
    configs: IViewConfig[]
  ): Array<Phaser.GameObjects.GameObject | any> {
    if (!configs || configs.length === 0) {
      return null;
    }

    return configs.map((config) => {
      switch (config.type) {
        case "Image":
          return new Image(scene, config as IImageConfig);

        case "Text":
          return new Text(scene, config as ITextConfig);

        case "NinePatch":
          return this._createNinePatch(scene, config as INinePatchConfig);

        case "Rectangle":
          return this._createRectangle(scene, config as IRectangleConfig);

        case "Triangle":
          return this._createTriangle(scene, config as ITriangleConfig);

        case "Circle":
          return this._createCircle(scene, config as ICircleConfig);

        case "Prefab":
          return this._createPrefab(scene, config as IPrefabConfig);

        case "Spine":
          return new Spine(scene, config as ISpineConfig);

        case "Spritesheet":
          return new Spritesheet(scene, config as ISpritesheetConfig);

        default:
          return this.createView(scene, config);
      }
    });
  }

  private static _createNinePatch(
    scene: Phaser.Scene,
    config: INinePatchConfig
  ): NinePatch {
    const ninepatch = scene.make.rexNinePatch({
      x: config.x ?? 0,
      y: config.y ?? 0,
      width: config.width,
      height: config.height,
      key: config.key,
      baseFrame: config.baseFrame,
      columns: config.columns.map((c) => (c === null ? undefined : c)),
      rows: config.rows.map((r) => (r === null ? undefined : r)),
    });
    ninepatch.setName(config.name);
    if (config.origin) {
      ninepatch.setOrigin(config.origin.x, config.origin.y);
    }
    if (config.displaySize) {
      ninepatch.setDisplaySize(
        config.displaySize.width,
        config.displaySize.height
      );
    }
    Phaser.GameObjects.BuildGameObject(scene, ninepatch, config);
    return ninepatch;
  }

  private static _createRectangle(
    scene: Phaser.Scene,
    config: IRectangleConfig
  ): RoundRectangle {
    const rectangle = new RoundRectangle(
      scene,
      config.x,
      config.y,
      config.width,
      config.height,
      config.radius,
      convertColor(config.color),
      config.alpha ?? config.rect_alpha ?? 1
    );
    if (config.name) {
      rectangle.setName(config.name);
    }
    if (config.stroke) {
      rectangle.setStrokeStyle(
        valueOrDefault(config?.stroke?.thickness, 1),
        convertColor(valueOrDefault(config.stroke?.color, "#ffffff")),
        valueOrDefault(config?.stroke?.alpha, 1)
      );
    }
    if (config.useHandCursor) {
      rectangle.setInteractive({ useHandCursor: true });
    }

    Phaser.GameObjects.BuildGameObject(scene, rectangle, config);

    return rectangle;
  }

  protected static _createTriangle(
    scene: Phaser.Scene,
    config: ITriangleConfig
  ): Phaser.GameObjects.Triangle {
    const triangle = scene.add.triangle(
      config.x ?? 0,
      config.y ?? 0,
      config.x1 ?? 0,
      config.y1 ?? 0,
      config.x2 ?? 0,
      config.y2 ?? 0,
      config.x3 ?? 0,
      config.y3 ?? 0,
      convertColor(config.color ?? "#ffffff"),
      config.alpha
    );
    if (config.name) {
      triangle.setName(config.name);
    }
    if (config.stroke) {
      triangle.setStrokeStyle(
        valueOrDefault(config?.stroke?.thickness, 1),
        convertColor(valueOrDefault(config.stroke?.color, "#ffffff")),
        valueOrDefault(config?.stroke?.alpha, 1)
      );
    }
    Phaser.GameObjects.BuildGameObject(scene, triangle, config);
    return triangle;
  }

  private static _createCircle(
    scene: Phaser.Scene,
    config: ICircleConfig
  ): Phaser.GameObjects.Arc {
    const circle = scene.add.arc(
      config.x ?? 0,
      config.y ?? 0,
      config.radius,
      config.startAngle ?? 0,
      config.endAngle ?? 360,
      config.anticlockwise ?? false,
      convertColor(config.color ?? "#ffffff"),
      config.alpha
    );
    if (config.name) {
      circle.setName(config.name);
    }
    if (config.stroke) {
      circle.setStrokeStyle(
        valueOrDefault(config?.stroke?.thickness, 1),
        convertColor(valueOrDefault(config.stroke?.color, "#ffffff")),
        valueOrDefault(config?.stroke?.alpha, 1)
      );
    }
    Phaser.GameObjects.BuildGameObject(scene, circle, config);
    return circle;
  }

  private static _createPrefab(
    scene: Phaser.Scene,
    config: IPrefabConfig
  ): View {
    const key = config.key;
    if (!scene.cache.json.exists(key)) {
      this._instance._log.e(`key=${key} not found!`);
      return null;
    }
    const viewConfig = {
      ...scene.cache.json.get(key),
      ...(({ type, key, ...others }) => others)(config),
    };

    return this.createView(scene, viewConfig);
  }

  private readonly _viewTypes = new Map<string, typeof View>([
    [Button.typeName, Button],
    [View.typeName, View],
  ]);

  private readonly _log = Log.getLog("LayoutBuilder", Log.ERROR);

  destroy(): void {
    this._viewTypes.clear();
  }
}

export default LayoutFactory;
