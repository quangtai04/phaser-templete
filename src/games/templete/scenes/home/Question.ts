import { Choice } from "./Choice";

interface IQuestion {
  scene: Phaser.Scene;
  x: number;
  y: number;
  img_question: string;
  text_question: string;
  choices: Array<string>;
}
export class Question extends Phaser.GameObjects.Container {
  private _img_question: Phaser.GameObjects.Image;
  private _text_question: Phaser.GameObjects.Text;
  private _choices: Array<Choice> = [];

  constructor(params: IQuestion) {
    super(params.scene, params.x, params.y);
    this.scene.add.existing(this);
    this._img_question = this.scene.add.image(960, 200, params.img_question);
    this._text_question = this.scene.add.text(960, 400, params.text_question, {
      fontFamily: "Arial",
      fontSize: 32,
      color: "#000000",
    });
    this.add(this._img_question);
    this.add(this._text_question);
    this.createChoices(params.choices);
  }
  createChoices(choices: Array<string>) {
    choices.forEach((choice, index) => {
      const choiceObj = new Choice({
        scene: this.scene,
        x: 200 + index * 200,
        y: 600,
        text: choice,
      });
      this._choices.push(choiceObj);
      this.add(choiceObj);
    });
  }
}
