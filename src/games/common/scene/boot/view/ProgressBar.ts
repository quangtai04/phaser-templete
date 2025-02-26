import { Observable, Subject } from "rxjs";
import View, { IViewConfig } from "../../../../skframework/view/View";

export class ProgressBarBase extends View {
  protected targetProgress = 0;
  protected progress = 0;
  protected progressSubject = new Subject<number>();

  onProgressAsObservable(): Observable<number> {
    return this.progressSubject;
  }

  setProgress(value: number): this {
    this.targetProgress = value;
    return this;
  }
}

export default class ProgressBar extends ProgressBarBase {
  static readonly typeName: string = "ProgressBar";

  constructor(
    scene: Phaser.Scene,
    config: IViewConfig,
    children?: Phaser.GameObjects.GameObject[]
  ) {
    super(scene, config, children);
    this.scene.sys.updateList.add(this);
  }

  protected preUpdate(time: number, delta: number): void {
    if (this.progress >= this.targetProgress) {
      return;
    }

    this.progress = Math.min(this.progress + delta / 1000, this.targetProgress);
    this.progressSubject.next(this.progress);
  }
}
