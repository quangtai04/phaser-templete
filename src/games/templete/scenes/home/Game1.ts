import Phaser from 'phaser'

const GROUND_KEY = 'ground'

export class Game1 extends Phaser.Scene {
    private _player: Phaser.Physics.Arcade.Sprite;
    private _platforms: Phaser.Physics.Arcade.StaticGroup;
    private _stars: Phaser.Physics.Arcade.Group;
    private _cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor() {
        super({ key: "Game1" });
    }

    preload () {
        this.load.image("bomb", "/assets/bomb.png");
        this.load.image("ground", "/assets/platform.png");
        this.load.image("sky", "/assets/sky.png");
        this.load.image("star", "/assets/star.png");
        this.load.spritesheet("dude", 
            "/assets/dude.png", 
            {frameWidth: 32, frameHeight: 48});
    };

    create ()  {
        this.add.image(400, 300, "sky");

        this._platforms = this.physics.add.staticGroup();
        this._platforms.create(400, 568, GROUND_KEY).setScale(2).refreshBody();
        this._platforms.create(600, 400, GROUND_KEY);
        this._platforms.create(50, 250, GROUND_KEY);
        this._platforms.create(750, 220, GROUND_KEY);

        this.add.image(400, 300, "star");
        
        this._player = this.physics.add.sprite(100, 450, 'dude');
        this._player.setBounce(0.2);
        this._player.setCollideWorldBounds(true);

        this.physics.add.collider(this._player, this._platforms);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'turn',
            frames: [{key: 'dude', frame: 4}],
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
            frameRate: 10,
            repeat: -1
        })

        this._stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });
        this._stars.children.iterate((child) => {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
            return true;
        })
    };

    update ()  {
        this._cursors = this.input.keyboard.createCursorKeys();
        if (this._cursors.left.isDown){
            this._player.setVelocityX(-160);
            this._player.anims.play('left', true);
        }
        else if (this._cursors.right.isDown){
            this._player.setVelocityX(160);
            this._player.anims.play('right', true);
        }
        else {
            this._player.setVelocityX(0);
            this._player.anims.play('turn');
        }  
        if (this._cursors.up.isDown && this._player.body.touching.down){
            this._player.setVelocityY(-330);
        }
    };
}