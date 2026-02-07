const X_VELOCITY = 200;
const Y_VELOCITY = 200;

class Player {
  constructor({
    x,
    y,
    size = { width: 32, height: 32 },
    velocity = { x: 0, y: 0 },
    catSprite = "black-cat-Sheet.png",
  }) {
    this.x = x;
    this.y = y;
    this.width = size.width; // 32px
    this.height = size.height; // 32px
    this.velocity = velocity;

    this.image = new Image();
    this.image.src = `./img/${catSprite}`;
    console.log(`Player sprite: ${catSprite}`);

    // Storleken på framen vi vill klippa ut
    this.frameWidth = 32;
    this.frameHeight = 32;

    this.direction = "down";

    this.directionRows = {
      down: 0,
      left: 1,
      right: 2,
      up: 3,
    };
  }

  draw(c) {
    // Red square debug code
    c.fillStyle = "rgba(0, 0, 255, 0)";
    c.fillRect(this.x, this.y, this.width, this.height);

    const row = this.directionRows[this.direction];

    const frameY = row * this.frameHeight; // row = {0,1,2,3} frameHeight = 32

    // Rita ut spelaren
    c.drawImage(
      this.image, // Bildfilen
      0, // Vilken ruta i spritesheeten (x-led)s
      frameY, // Vilken ruta i spritesheeten (y-led)
      this.frameWidth, // Hur bred en ruta i spritesheet är
      this.frameHeight, // Hur hög en ruta i spritesheet är
      this.x, // Var på canvasen den ska ritas i x-led
      this.y, // Var på canvasen den ska ritas i y-led
      this.width, // Hur bred den ska ritas på canvasen
      this.height, // Hur hög den ska ritas på canvasen
    );
  }

  update(deltaTime, collisionBlocks) {
    if (!deltaTime) return;

    // Update horizontal position and check collisions
    this.updateHorizontalPosition(deltaTime);
    this.checkForHorizontalCollisions(collisionBlocks);

    // Update vertical position and check collisions
    this.updateVerticalPosition(deltaTime);
    this.checkForVerticalCollisions(collisionBlocks);
  }

  updateHorizontalPosition(deltaTime) {
    this.x += this.velocity.x * deltaTime;
  }

  updateVerticalPosition(deltaTime) {
    this.y += this.velocity.y * deltaTime;
  }

  handleInput(keys) {
    this.velocity.x = 0;
    this.velocity.y = 0;

    if (keys.d.pressed) {
      this.velocity.x = X_VELOCITY;
      this.direction = "right";
    } else if (keys.a.pressed) {
      this.velocity.x = -X_VELOCITY;
      this.direction = "left";
    } else if (keys.w.pressed) {
      this.velocity.y = -Y_VELOCITY;
      this.direction = "up";
    } else if (keys.s.pressed) {
      this.velocity.y = Y_VELOCITY;
      this.direction = "down";
    }
  }

  checkForHorizontalCollisions(collisionBlocks) {
    const buffer = 0.0001;
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i];

      // Check if a collision exists on all axes
      if (
        this.x <= collisionBlock.x + collisionBlock.width &&
        this.x + this.width >= collisionBlock.x &&
        this.y + this.height >= collisionBlock.y &&
        this.y <= collisionBlock.y + collisionBlock.height
      ) {
        // Check collision while player is going left
        if (this.velocity.x < -0) {
          this.x = collisionBlock.x + collisionBlock.width + buffer;
          break;
        }

        // Check collision while player is going right
        if (this.velocity.x > 0) {
          this.x = collisionBlock.x - this.width - buffer;

          break;
        }
      }
    }
  }

  checkForVerticalCollisions(collisionBlocks) {
    const buffer = 0.0001;
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i];

      // If a collision exists
      if (
        this.x <= collisionBlock.x + collisionBlock.width &&
        this.x + this.width >= collisionBlock.x &&
        this.y + this.height >= collisionBlock.y &&
        this.y <= collisionBlock.y + collisionBlock.height
      ) {
        // Check collision while player is going up
        if (this.velocity.y < 0) {
          this.velocity.y = 0;
          this.y = collisionBlock.y + collisionBlock.height + buffer;
          break;
        }

        // Check collision while player is going down
        if (this.velocity.y > 0) {
          this.velocity.y = 0;
          this.y = collisionBlock.y - this.height - buffer;
          break;
        }
      }
    }
  }
}
