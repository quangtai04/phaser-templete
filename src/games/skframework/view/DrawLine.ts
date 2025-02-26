import { convertColor } from '../util/Util';
import View, { IViewConfig } from './View';

export interface ILineConfig {
  line_width?: number;
  line_color?: string;
  line_alpha?: number;
  count_point?: number;
  animation?: {
    duration: number;
  };
}

export interface IDrawLineConfig extends IViewConfig {
  points: Array<number>;
  line_config?: ILineConfig;
  auto_draw?: boolean;
}

export class DrawLine extends View {
  static readonly typeName: string = 'DrawLine';
  private _curve: Phaser.Curves.Spline;
  private _points: Array<number>;
  private _graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, config: IDrawLineConfig, children?: Phaser.GameObjects.GameObject[]) {
    super(scene, config, children);
    this._graphics = this.scene.add.graphics();
    this.add(this._graphics);
    (this.layoutConfig as IDrawLineConfig).line_config = {
      line_width: 1,
      line_color: '#000000',
      line_alpha: 1,
      count_point: 200,
      ...config.line_config,
    };
    if (config.points) {
      this.setLine(config.points);
      if (config.auto_draw) this.drawLine();
    }
  }
  setLine(points: Array<number>): this {
    this._points = [];
    points.forEach((v, i) => {
      if (i % 2 === 0) this._points[i] = v;
      else this._points[i] = v;
    });
    this._curve = new Phaser.Curves.Spline(this._points);
    return this;
  }
  drawLine(config?: ILineConfig): Promise<this> {
    const layoutConfig = this.layoutConfig as IDrawLineConfig;
    const line_config = { ...layoutConfig.line_config, ...config };
    if (line_config.animation) {
      const { duration } = line_config.animation ?? { duration: 1000 };
      const points = this._curve.getPoints(line_config.count_point);
      return new Promise((resolve) => {
        this.scene?.tweens.addCounter({
          duration: duration,
          onUpdate: (tween) => {
            this._curve.points = [...points].slice(0, Math.floor(points.length * tween.getValue()));
            this._draw(line_config);
          },
          onComplete: () => {
            this._curve.points = points;
            this._draw(line_config);
            resolve(this);
          },
        });
      });
    } else {
      this._draw(line_config);
      return Promise.resolve(this);
    }
  }
  set line_config(value: ILineConfig) {
    (this.layoutConfig as IDrawLineConfig).line_config = {
      ...(this.layoutConfig as IDrawLineConfig).line_config,
      ...value,
      ...(value?.animation
        ? {
            animation: {
              ...(this.layoutConfig as IDrawLineConfig).line_config?.animation,
              ...value.animation,
            },
          }
        : {}),
    };
  }
  clear(): this {
    this._graphics.clear();
    return this;
  }
  private _draw(line_config: ILineConfig): this {
    this._graphics.clear();
    this._graphics.lineStyle(line_config.line_width, convertColor(line_config.line_color), line_config.line_alpha);
    this._curve.draw(this._graphics, line_config.count_point);
    return this;
  }
}
