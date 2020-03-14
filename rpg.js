var player;
var enemies = [];
var enemiesToSpawn = 10;
var enemiesLeft = enemiesToSpawn;
var enemiesAreSafe = true;

// HP
var hitPoints = 5;
var hitPointsString = "FADE HP: ";
var hitPointsText;

// score
var score = 0;
var scoreString = "Score: ";
var scoreText;

var introText;

var gameStarted;

var finishedGame;

var gamePlay = new Phaser.Class({
  // Define scene
  Extends: Phaser.Scene,
  initialize: function GamePlay() {
    Phaser.Scene.call(this, { key: "GamePlay" });
  },
  
  
  preload: function() {
    this.load.tilemapTiledJSON('map1', 'assets/map/map1.json');
    this.load.image('coin', 'assets/map/coinGold.png');

    this.load.image(
      "sky",
      "assets/map/grass.png"
    );
    this.load.spritesheet(
      "dude",
      "https://raw.githubusercontent.com/cattsmall/Phaser-game/5-2014-game/assets/dude.png",
      {
        frameWidth: 32,
        frameHeight: 48
      }
    );
    this.load.spritesheet(
      "baddie",
      "assets/enemy/firespirit.png",
      {
        frameWidth: 32,
        frameHeight: 32
      }
    );
  },

  
  create: function() {
    map = this.make.tilemap({key: 'map1'});
    var coinTiles = map.addTilesetImage('coin');
    coinLayer = map.createDynamicLayer('Coins', coinTiles, 0, 0);
  

    this.physics.add.sprite(config.width / 2, config.height / 2, "sky");

    player = this.physics.add.sprite(32, config.height - 150, "dude");
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 0 }),
      repeat: -1
    });
    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers("dude", { start: 1, end: 1 }),
      repeat: -1
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 2, end: 2 })
    });
    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers("dude", { start: 3, end: 3 })
    });

    player.setCollideWorldBounds(true);

    cursors = this.input.keyboard.createCursorKeys();

    enemiesAreSafe = false;

    // Create enemies
    enemies = this.physics.add.staticGroup({
      key: "baddie",
      repeat: enemiesToSpawn
    });

    enemies.children.iterate(function(enemy) {
      enemy.setX(Phaser.Math.FloatBetween(32, config.width - 32));
      enemy.setY(Phaser.Math.FloatBetween(32, config.height - 32));
      if (enemy.x > config.width - 32) {
        enemy.setX(config.width - 48);
      } else if (enemy.x < 32) {
        enemy.setX(48);
      }

      if (enemy.y > config.height - 32) {
        enemy.setY(config.height - 48);
      } else if (enemy.y < 32) {
        enemy.setY(48);
      }
    });

    this.anims.create({
      key: "safe",
      frames: this.anims.generateFrameNumbers("baddie", { start: 1, end: 1 })
    });

    this.anims.create({
      key: "unsafe",
      frames: this.anims.generateFrameNumbers("baddie", { start: 0, end: 0 })
    });

    enemies.refresh();

    

    var healthstyle = { font: "10px Arial", fill: "#ff0044", align: "center", backgroundColor:"black"};
    hitPointsText = this.add.text(32, 24, hitPointsString + hitPoints, healthstyle);
    hitPointsText.visible = false;
    var scorestyle = { font: "10px Arial", fill: "#ff0044", align: "center", backgroundColor:"black"};
    scoreText = this.add.text(32, 50, scoreString + score, scorestyle);
    scoreText.visible = false;

    var style = { font: "20px Arial", fill: "#ff0044", align: "center", backgroundColor:"black"};
  
    introText = this.add.text(
        50,
        200,
    
        "---------------TIP-------------\n Kill all the Enemies when they're weak when they Fade! \n Plus score when you kill the enemy when its in fade condition \n Minus Health when its not on the fade state.",
            style)
      
    this.input.on("pointerdown", function() {
      if (!gameStarted) {
        startGame();
      }
    });

    timedEvent = this.time.addEvent({
      delay: 1000,
      callback: switchEnemyState,
      callbackScope: this,
      loop: true
    });

    coinLayer.setTileIndexCallback(17, collectCoin, this);
    this.physics.add.overlap(player, coinLayer);
    this.physics.add.overlap(player, enemies, collideWithEnemy, null, this);
  },

  
  update: function() {
    // Update objects & variables
    player.setVelocity(0, 0);
    if (gameStarted && !finishedGame) {
      if (cursors.left.isDown) {
        //  Move to the left
        player.setVelocityX(-150);
        player.anims.play("left");
      } else if (cursors.right.isDown) {
        //  Move to the right
        player.setVelocityX(150);
        player.anims.play("right");
      }

      if (cursors.up.isDown) {
        //  Move up
        player.setVelocityY(-150);
        player.anims.play("up");
      } else if (cursors.down.isDown) {
        //  Move down
        player.setVelocityY(150);
        player.anims.play("down");
      }

      // Update score
      scoreText.setText(scoreString + score);
      hitPointsText.setText(hitPointsString + hitPoints);
    }
  }
});


function collectCoin(tile) {

    coinLayer.removeTileAt(tile.x, tile.y); 
  
    score++; 
    scoreText.setText(scoreString + score);
  
  }
function switchEnemyState() {
  if (gameStarted && !finishedGame) {
    if (enemiesAreSafe == false) {
      enemiesAreSafe = true;
      enemies.children.iterate(function(enemy) {
        enemy.anims.play("safe");
     
      });
    } else {
      enemiesAreSafe = false;
      enemies.children.iterate(function(enemy) {
        enemy.anims.play("unsafe");
       
      });
    }
  }
}


function collideWithEnemy(player, enemy) {
  if (gameStarted && !finishedGame) {
    if (enemiesAreSafe == false) {
      // unsafe hit
      hitPoints--;
    } else {
      // safe hit
      score++;
    }

    enemy.disableBody(true, true);
    enemiesLeft--;

    if (hitPoints <= 0) {
      killGame();
      introText.setText("Game Over! Refresh to play again.");
    }if (hitPoints > 0 && enemiesLeft < 0) {
      killGame();
      introText.setText("You Won! Refresh to play again.");
    }
  }
}

function startGame() {
  introText.visible = false;
  scoreText.visible = true;
  hitPointsText.visible = true;
  gameStarted = true;
  finishedGame = false;
}

function killGame() {
  finishedGame = true;
  player.setVelocity(0, 0);
  introText.visible = true;

  scoreText.visible = false;
  hitPointsText.visible = false;
}

var config = {
  type: Phaser.AUTO,
  width: 640,
  height: 480,
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: gamePlay
};

//Instantiate the game with the config
var game = new Phaser.Game(config);
