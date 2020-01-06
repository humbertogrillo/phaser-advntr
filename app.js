var config = {
    type: Phaser.AUTO,
    width: 400,
    height: 400,
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 250 },
            debug: false,
        }
    }
};
var game = new Phaser.Game(config);

function preload (){
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', {
        frameWidth: 32,
        frameHeight: 48
    });
}

var platforms;
var player;
var stars;
var bombs;
var cursors;
var score = 0;
var scoreText;
var gameOver;

function create (){
    this.add.image(200, 200, 'sky');

    platforms = this.physics.add.staticGroup();
    platforms.create(200, 384, 'ground');
    platforms.create(300,288, 'ground').setScale(.5).refreshBody();
    platforms.create(25,192, 'ground').setScale(.5).refreshBody();
    platforms.create(375, 96, 'ground').setScale(.5).refreshBody();

    player = this.physics.add.sprite(100, 300, 'dude');

    this.physics.add.collider(player,platforms);

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY:{ x: 6, y: 0, stepX: 30}
    });
    stars.children.iterate(function(child){
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    this.physics.add.collider(stars,platforms);
    this.physics.add.overlap(player,stars,collectStar, null, this);

    scoreText = this.add.text(8,8, 'score: 0', {fontSize: '20px', fill: '#000'});

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', {start: 0, end:3}),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4}],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', {start: 5, end:8}),
        frameRate: 10,
        repeat: -1
    });
    cursors = this.input.keyboard.createCursorKeys();

}

function update(){
    if(cursors.left.isDown){
        player.setVelocityX(-160);
        player.anims.play('left', true);
    }else if(cursors.right.isDown){
        player.setVelocityX(160);
        player.anims.play('right', true);
    }else{
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if(cursors.up.isDown && player.body.touching.down){
        player.setVelocityY(-240);
    }
}

function collectStar(player, star){
    star.disableBody(true, true);

    score += 10;
    scoreText.setText(`Score: ${score}`);

    if(stars.countActive(true) === 0){
        stars.children.iterate(function(child){
            child.enableBody(true, child.x, 0, true, true);
        });
    }

    var x = (player.x < 200) ? Phaser.Math.Between(200,400) : Phaser.Math.Between(0,200);
    var bomb = bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-100, 100), 2);
}

function hitBomb(player, bomb){
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
}
