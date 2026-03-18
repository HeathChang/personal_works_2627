import Phaser from "phaser";


const config = {
  // WebGL (Web graphics library) JS Api for rendering 2D and 3D graphics
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    // Arcade physics plugin, manages physics simulation
    default: 'arcade',
    arcade: {
      gravity: { y: 200 }
    }
  },
  scene: {
    preload,
    create,
    update,
  }
}

// preload: Loading assets such as images, audio, etc.
function preload() {
  // scene context
  this.load.image('sky', 'assets/sky.png');
  this.load.image('bird', 'assets/bird.png');
}
let bird = null;
let totalDelta = 0;

// create: Creating game objects and setting up the game logic.
function create() {
  // x, y, image key
  this.add.image(0, 0, 'sky').setOrigin(0, 0);
  // middle of height, 1/10 width
  bird = this.physics.add.sprite(config.width / 10, config.height / 2, 'bird').setOrigin(0); // Sprite 객체(애니메이션 가능한 이미지)를 생성하는 API
}

function update(time, delta) {
  totalDelta += delta;

  if (totalDelta < 1000) { return; }

  console.log(bird.body.velocity.y);
  totalDelta = 0;
}


new Phaser.Game(config);