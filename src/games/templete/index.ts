import { Home } from "./scenes/home/Home";

class TempleteGame extends Phaser.Game {
  constructor() {
    super({
      width: 1920,
      height: 1080,
      type: Phaser.AUTO,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [Home],
      parent: "board-game",
      backgroundColor: "#D3D3D3",
    });
  }
}
export default TempleteGame;
