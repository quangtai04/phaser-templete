export abstract class Component {
  protected readonly scene: Phaser.Scene;

  public readonly gameObject: Phaser.GameObjects.GameObject;

  constructor(scene: Phaser.Scene, gameObject: Phaser.GameObjects.GameObject) {
    this.scene = scene;
    this.gameObject = gameObject;
  }
}
