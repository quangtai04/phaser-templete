import Phaser from 'phaser'

const GROUND_KEY = 'ground'

export class Game1 extends Phaser.Scene {
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
        // const platforms = this.physics.add.staticGroup();
        // platforms.create(400, 568, GROUND_KEY).setScale(2).reFreshBody();;
        // platforms.create(600, 400, GROUND_KEY);
        // platforms.create(50, 250, GROUND_KEY);
        // platforms.create(750, 220, GROUND_KEY);

        let platforms = this.physics.add.staticGroup();

        let platform = platforms.create(400, 568, 'ground');
        platform.setScale(2);
        platform.refreshBody();

        platforms.create(600, 400, GROUND_KEY);
        platforms.create(50, 250, GROUND_KEY);
        platforms.create(750, 220, GROUND_KEY);

        this.add.image(400, 300, "star");
        
        const player = this.physics.add.sprite(100, 450, 'dude');

        player.setBounce(0.2);
        player.setCollideWorldBounds(true);
        //player.body.setGravityY(1);
        this.physics.add.collider(player, platform);
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
    };
    update ()  {
        const cursors = this.input.keyboard.createCursorKeys();
        if (cursors.left.isDown)
            {
                player.setVelocityX(-160);
            
                player.anims.play('left', true);
            }
            else if (cursors.right.isDown)
            {
                player.setVelocityX(160);
            
                player.anims.play('right', true);
            }
            else
            {
                player.setVelocityX(0);
            
                player.anims.play('turn');
            }
            
            if (cursors.up.isDown && player.body.touching.down)
            {
                player.setVelocityY(-330);
            }
    };
}