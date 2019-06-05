var canvas = document.querySelector('canvas');
var context = canvas.getContext('2d');

const DPR = window.devicePixelRatio || 1;
const SIZE = window.innerWidth * .33;
const GRID_SIZE = 5;
const GRID_WIDTH = Math.floor(SIZE/GRID_SIZE);
const MARGIN =  (SIZE % GRID_SIZE) / 2;
const STEP = SIZE / 20;
const ON = 0;
const OFF = 255;

canvas.width = SIZE * DPR;
canvas.height = SIZE * DPR;
context.scale(DPR, DPR);

// BUG: When the grid is zoomed out, the edges of the grid won't update

const getStartingGrid = (gridGenerator) => {
  let grid = [];
  for(let x = 0; x < GRID_WIDTH; x++){
    let column = [];
    for(let y = 0; y < GRID_WIDTH; y++){
      column.push(gridGenerator());
    }
    grid.push(column);
  }
  return grid;
};

const binaryGreyscaleGrid = () => {
  return getStartingGrid(() => { return Math.random() > .5 ? ON: OFF; });
};

const gradientGreyscaleGrid = () => {
  return getStartingGrid(() => { 
    if(Math.random() >= .999){
      return Math.floor(Math.random() * 255);
    }
    return 254;
  });
};

const drawGrid = (grid) => {
  grid.map((column, x) => {
    column.map((cell_color, y) => {
      context.save();
      context.fillStyle = `rgb(${cell_color}, ${cell_color}, ${cell_color})`;
      context.translate(x * GRID_SIZE + MARGIN, y * GRID_SIZE + MARGIN)
      context.fillRect(0, 0, GRID_SIZE, GRID_SIZE)
      context.restore();
    })
  })
}

const getNeighbors = (grid, x, y) => {
  const GRID_WIDTH = 3; // This is the little nugget that's wreaking conway
  let above = y-1;
  let below = y+1;
  let left  = x-1;
  let right = x+1;
  if (above < 0) { above = GRID_WIDTH - 1; }
  if (below >= GRID_WIDTH) { below = 0; }
  if (left < 0) { left = GRID_WIDTH -1; }
  if (right >= GRID_WIDTH) { right = 0; }
  return {
    north: grid[x][above],
    northEast: grid[right][above],
    east: grid[right][y],
    southEast: grid[right][below],
    south: grid[x][below],
    southWest: grid[left][below],
    west: grid[left][y],
    northWest: grid[left][above]
  }
};

const wavesReduceNeighbors = (neighbors) => {
  const sum = Object.keys(neighbors).reduce((previous, key) => {
    return previous + neighbors[key];
  }, 0);
  return sum / Object.keys(neighbors).length;
};

const conwayReduceNeigbors = (neighbors) => {
  const sum = Object.keys(neighbors).reduce((previous, key) => {
    return previous + neighbors[key];
  }, 0);
  return 8 - (sum / 255);
}

const wavesGetNextColors = (average, currentCell, previousCell) => {
  if(average == 255)
    return 0;
  if(average == 0)
    return 255;
  let nextState = currentCell + average - previousCell;
  nextState = Math.min(nextState, 255);
  nextState = Math.max(nextState, 0);
  return nextState;
}

const conwayGetNextColors = (cellCount, cellState) => {
  if (cellState == ON) {
    if(cellCount < 2 || cellCount > 3) {
      return OFF;
    }
    return ON;
  }
  if(cellCount == 3)
    return ON;
  return OFF;
}

const getNextGrid = (currentGrid, previousGrid, getReducedNeighbors, getNextColors) => {
  const neighborCountGrid = currentGrid.map((column, x) => {
    return column.map((_, y) => {
      return getReducedNeighbors(getNeighbors(currentGrid, x, y));
    });
  })

  const colorGrid = neighborCountGrid.map((column, x) => {
    return column.map((reduced_cell, y) => {
      return getNextColors(reduced_cell, currentGrid[x][y], previousGrid[x][y]);
    });
  })
  return colorGrid;
};

const getNextConwayGrid = (currentGrid, previousGrid) => {
  return getNextGrid(currentGrid, previousGrid, conwayReduceNeigbors, conwayGetNextColors);
}

const getNextWavesGrid = (currentGrid, previousGrid) => {
  return getNextGrid(currentGrid, previousGrid, wavesReduceNeighbors, wavesGetNextColors);
}

const getNextGridScroll = (currentGrid) => {
  currentGrid.unshift(currentGrid.pop());
  return currentGrid;
}

const draw = (currentGrid, previousGrid) => {
  context.globalCompositeOperation = 'destination-over';
  context.clearRect(0, 0, SIZE*DPR, SIZE*DPR);
  const nextGrid = getNextConwayGrid(currentGrid, previousGrid);
  drawGrid(nextGrid);
  setTimeout(() => {
    window.requestAnimationFrame(() => draw(nextGrid, currentGrid));
  }, 1000 / 10);
}

const init = () => {
  const startingGrid = binaryGreyscaleGrid();
  window.requestAnimationFrame(() => draw(startingGrid, startingGrid));
};

context.translate(STEP, STEP);
init();
