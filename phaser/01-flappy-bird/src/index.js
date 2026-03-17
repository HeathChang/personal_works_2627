import Phaser from "phaser";


const config = {
  // WebGL (Web graphics library) JS Api for rendering 2D and 3D graphics
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    // Arcade physics plugin, manages physics simulation
    default: 'arcade'
  },
  scene: {
    preload,
    create,
  }
}

// preload: Loading assets such as images, audio, etc.
function preload() {
  // scene context
  this.load.image('sky', 'assets/sky.png');
}

// create: Creating game objects and setting up the game logic.
function create() {
  // x, y, image key
  this.add.image(config.width / 2, config.height / 2, 'sky');
}



new Phaser.Game(config);