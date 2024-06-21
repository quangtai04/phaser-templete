interface IChoice {
  scene: Phaser.Scene;
  x: number;
  y: number;
  text: string;
}
export class Choice extends Phaser.GameObjects.Container {
  private _bg: Phaser.GameObjects.Image;
  private _text: Phaser.GameObjects.Text;

  constructor(params: IChoice) {
    super(params.scene, params.x, params.y);
    this._bg = this.scene.add.image(0, 0, "logo");
    this._text = this.scene.add.text(0, 0, params.text, {
      fontFamily: "Arial",
      fontSize: 32,
      color: "#000000",
    });
    this._bg
      .setInteractive({ cursor: "pointer" })
      .on(Phaser.Input.Events.POINTER_OVER, () => {
        console.log("Hover", params.text);
      })
      .on(Phaser.Input.Events.POINTER_OUT, () => {
        console.log("Out", params.text);
      })
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        console.log("Choice", params.text);
      });
    this.add([this._bg, this._text]);
    this.scene.add.existing(this);
  }
}
