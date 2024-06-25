import { Game1 } from "./scenes/home/Game1"

class TempleteGame extends Phaser.Game {
  constructor() {
    super({
      width: 800,
      height: 600,
      type: Phaser.AUTO,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: {
            gravity: {x: 0, y: 300 },
            debug: false
        }
      },
      scene: [Game1],
      parent: "board-game",
      backgroundColor: "#D3D3D3",
    });
  }
}
export default TempleteGame;
