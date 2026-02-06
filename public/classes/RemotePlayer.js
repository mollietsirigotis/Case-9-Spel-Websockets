class RemotePlayer {
  constructor({ playerId, username, x, y, direction }) {
    this.playerId = playerId;
    this.username = username;
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.direction = direction || "down";

    this.image = new Image();
    this.image.src = "./img/black-cat-Sheet.png";

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
}
