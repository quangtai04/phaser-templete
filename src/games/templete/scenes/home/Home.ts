import { Question } from "./Question";

export class Home extends Phaser.Scene {
  private _bg: Phaser.GameObjects.Image;
  private _questions: Array<Question> = [];

  constructor() {
    super({ key: "Home" });
  }
  preload() {
    this.load.image("logo", "/logo192.png");
  }
  create() {
    const questions: any[] = [
      //
      {
        text: "What is your name?",
        choices: ["A", "B", "C", "D"],
      },
      {
        text: "What is your age?",
        choices: ["A", "B", "C", "D"],
      },
    ];
    questions.forEach((question, index) => {
      const questionObj = new Question({
        scene: this,
        x: 0,
        y: 0,
        img_question: "logo",
        text_question: question.text,
        choices: question.choices,
      });
      questionObj.setAlpha(0);
      this._questions.push(questionObj);
    });
    this._questions[0].setAlpha(1);
  }
}
