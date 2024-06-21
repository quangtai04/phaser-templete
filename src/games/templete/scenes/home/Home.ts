export class Home extends Phaser.Scene {
  constructor() {
    super({ key: "Home" });
  }
  create() {
    this.add
      .text(960, 540, "Hello World", {
        fontFamily: "Arial",
        fontSize: 64,
        color: "#000000",
      })
      .setOrigin(0.5, 0.5);
  }
}
