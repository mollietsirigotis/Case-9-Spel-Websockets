const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const dpr = window.devicePixelRatio || 1;

canvas.width = 1024 * dpr;
canvas.height = 576 * dpr;

const zoomLevel = 2;
c.imageSmoothingEnabled = false;

const layersData = {
  l_Collision: l_Collision,
  l_Background: l_Background,
  l_Decorations: l_Decorations,
};

const tilesets = {
  l_Collision: { imageUrl: "./img/terrain.png", tileSize: 16 },
  l_Background: { imageUrl: "./img/terrain.png", tileSize: 16 },
  l_Decorations: { imageUrl: "./img/decorations.png", tileSize: 16 },
};

// Tile setup
const collisionBlocks = [];
const blockSize = 16; // Assuming each tile is 16x16 pixels

collisions.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 1) {
      collisionBlocks.push(
        new CollisionBlock({
          x: x * blockSize,
          y: y * blockSize,
          size: blockSize,
        }),
      );
    }
  });
});

const renderLayer = (tilesData, tilesetImage, tileSize, context) => {
  // Calculate the number of tiles per row in the tileset
  // We use Math.ceil to ensure we get a whole number of tiles
  const tilesPerRow = Math.ceil(tilesetImage.width / tileSize);

  tilesData.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol !== 0) {
        // Adjust index to be 0-based for calculations
        const tileIndex = symbol - 1;

        // Calculate source coordinates
        const srcX = (tileIndex % tilesPerRow) * tileSize;
        const srcY = Math.floor(tileIndex / tilesPerRow) * tileSize;

        context.drawImage(
          tilesetImage, // source image
          srcX,
          srcY, // source x, y
          tileSize,
          tileSize, // source width, height
          x * 16,
          y * 16, // destination x, y
          16,
          16, // destination width, height
        );
      }
    });
  });
};

const renderStaticLayers = async () => {
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = canvas.width;
  offscreenCanvas.height = canvas.height;
  const offscreenContext = offscreenCanvas.getContext("2d");

  for (const [layerName, tilesData] of Object.entries(layersData)) {
    const tilesetInfo = tilesets[layerName];
    if (tilesetInfo) {
      try {
        const tilesetImage = await loadImage(tilesetInfo.imageUrl);
        renderLayer(
          tilesData,
          tilesetImage,
          tilesetInfo.tileSize,
          offscreenContext,
        );
      } catch (error) {
        console.error(`Failed to load image for layer ${layerName}:`, error);
      }
    }
  }

  // Optionally draw collision blocks and platforms for debugging
  // collisionBlocks.forEach(block => block.draw(offscreenContext));

  return offscreenCanvas;
};
// END - Tile setup

// Change xy coordinates to move player's default position
const player = new Player({
  x: 100,
  y: 50,
  size: { width: 32, height: 32 },
});

window.player = player;

const camera = {
  x: 0,
  y: 0,
};

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

let lastTime = performance.now();
let lastSentTime = 0;

function animate(backgroundCanvas) {
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  const scaleWidth = canvas.width / (dpr * zoomLevel);
  const scaleHeight = canvas.height / (dpr * zoomLevel);

  // Update player position

  player.handleInput(keys);

  player.update(deltaTime, collisionBlocks);

  // Skicka position till servern

  if (
    window.websocket &&
    window.websocket.readyState === 1 &&
    window.myPlayerData &&
    currentTime - lastSentTime > 50
  ) {
    window.websocket.send(
      JSON.stringify({
        type: "playerMove",
        playerId: window.myPlayerData.playerId,
        x: player.x,
        y: player.y,
        direction: player.direction,
      }),
    );

    lastSentTime = currentTime;
  }

  // Uppdatera alla remote players
  if (window.remotePlayers) {
    window.remotePlayers.forEach((remotePlayer) => {
      remotePlayer.update(deltaTime);
    });
  }

  camera.x = player.x + player.width / 2 - scaleWidth / 2;
  camera.y = player.y + player.height / 2 - scaleHeight / 2;

  // Render scene
  c.save();
  c.scale(dpr * zoomLevel, dpr * zoomLevel);
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.translate(-camera.x, -camera.y);
  c.drawImage(backgroundCanvas, 0, 0);

  // Rita alla remote players
  if (window.remotePlayers) {
    window.remotePlayers.forEach((remotePlayer) => {
      remotePlayer.draw(c);
    });
  }

  player.draw(c);
  c.restore();

  requestAnimationFrame(() => animate(backgroundCanvas));
}

const startRendering = async () => {
  try {
    const backgroundCanvas = await renderStaticLayers();
    if (!backgroundCanvas) {
      console.error("Failed to create the background canvas");
      return;
    }

    animate(backgroundCanvas);
  } catch (error) {
    console.error("Error during rendering:", error);
  }
};

startRendering();
