import { deepCopy } from '../util/Util';
import { IVector2, IViewConfig } from './View';

export interface ITextConfig extends IViewConfig {
  text: string;
  style: Phaser.Types.GameObjects.Text.TextStyle;
  origin?: IVector2;
  fillGradient?: { offset: number; color: string }[];
  maxWidth?: number;
}

export default class Text extends Phaser.GameObjects.Text {
  private static _metricsDict = new Map<string, Phaser.Types.GameObjects.Text.TextMetrics>();

  static getTextMetrics(hash: string): Phaser.Types.GameObjects.Text.TextMetrics {
    return this._metricsDict.get(hash);
  }

  static clearTextMetrics(): void {
    this._metricsDict.clear();
  }

  readonly layoutConfig: ITextConfig;

  private readonly _maxWidth: number;

  constructor(scene: Phaser.Scene, config: ITextConfig) {
    const style = deepCopy(config.style);
    let metricsHash = null;
    if (style) {
      metricsHash = `${style.fontFamily}-${style.fontSize}`;
      style.metrics = Text.getTextMetrics(metricsHash);
    }

    super(scene, config.x, config.y, config.text, style);

    if (style && !style.metrics) {
      Text._metricsDict.set(metricsHash, this.getTextMetrics());
    }

    this.layoutConfig = deepCopy(config);

    Phaser.GameObjects.BuildGameObject(scene, this, config);

    if (config.name) {
      this.setName(config.name);
    }
    if (config.displaySize) {
      this.setDisplaySize(config.displaySize.width, config.displaySize.height);
    }
    if (config.style && config.style.shadow) {
      this.setShadow(
        config.style.shadow.offsetX,
        config.style.shadow.offsetY,
        config.style.shadow.color,
        config.style.shadow.blur,
        config.style.shadow.stroke,
        config.style.shadow.fill,
      );
    }
    if (config.fillGradient) {
      const gradient = this.context.createLinearGradient(0, 0, 0, this.height);
      config.fillGradient.forEach(({ offset, color }) => {
        gradient.addColorStop(offset, color);
      });
      this.setFill(gradient);
    }

    this._maxWidth = config.maxWidth;
  }

  setGradient(topColor: string, bottomColor: string): this {
    const gradient = this.context.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, topColor); // Replace with your desired top color
    gradient.addColorStop(1, bottomColor); // Replace with your desired bottom color
    this.setFill(gradient);
    return this;
  }

  setText(value: string | string[]): this {
    if (this._maxWidth === undefined) {
      super.setText(value);
    } else {
      const joinedStr = Array.isArray(value) ? value.join('\n') : value;
      super.setText(joinedStr);
      if (this.width > this._maxWidth) {
        let trimmedStr = joinedStr;
        // Finds the minimum string that does not grow longer than the max width.
        do {
          trimmedStr = trimmedStr.substring(0, trimmedStr.length / 2);
          super.setText(`${trimmedStr}...`);
        } while (this.width > this._maxWidth);
        // Finds the maximum string that does not grow longer than the max width.
        for (let i = trimmedStr.length; i <= joinedStr.length; i++) {
          super.setText(`${trimmedStr}${joinedStr[i]}...`);
          if (this.width > this._maxWidth) {
            break;
          }
          trimmedStr += joinedStr[i];
        }
        super.setText(`${trimmedStr}...`);
      }
    }
    return this;
  }
}
