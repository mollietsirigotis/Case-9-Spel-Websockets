class RemotePlayer {
  constructor({ playerId, username, x, y, direction, catSprite }) {
    this.playerId = playerId;
    this.username = username;
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.direction = direction || "down";

    this.image = new Image();
    this.image.src = `./img/${catSprite}`;
    console.log(`Loading sprite: ${catSprite} for player: ${username}`);

    this.frameWidth = 32;
    this.frameHeight = 32;

    this.directionRows = {
      down: 0,
      left: 1,
      right: 2,
      up: 3,
    };
    this.targetX = x;
    this.targetY = y;
  }
  updatePosition(newX, newY, direction) {
    this.targetX = newX;
    this.targetY = newY;
    if (direction) {
      this.direction = direction;
    }
  }

  update(deltaTime) {
    const speed = 10;
    this.x += (this.targetX - this.x) * speed * deltaTime;
    this.y += (this.targetY - this.y) * speed * deltaTime;
  }

  draw(c) {
    // Räkna ut vilken rad i sprite sheet baserat på riktning
    const row = this.directionRows[this.direction];
    const frameY = row * this.frameHeight;

    // Rita katten
    c.drawImage(
      this.image,
      0,
      frameY,
      this.frameWidth,
      this.frameHeight,
      this.x,
      this.y,
      this.width,
      this.height,
    );

    // Rita användarnamn ovanför katten
    c.fillStyle = "white";
    c.strokeStyle = "black";
    c.lineWidth = 1;
    c.font = "bold 8px Arial";
    
    const textWidth = c.measureText(this.username).width;
    const textX = this.x + (this.width / 2) - (textWidth / 2);
    const textY = this.y - 5;
    
    c.strokeText(this.username, textX, textY);
    c.fillText(this.username, textX, textY);
  }
}
