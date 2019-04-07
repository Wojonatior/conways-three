var canvas = document.querySelector('canvas');
var context = canvas.getContext('2d');

const DPR = window.devicePixelRatio || 1;
const SIZE = window.innerWidth * .33;
const GRID_SIZE = 5;
const GRID_WIDTH = Math.floor(SIZE/GRID_SIZE);
const MARGIN =  (SIZE % GRID_SIZE) / 2;
const STEP = SIZE / 20;
const ON = 'black';
const OFF = 'white';

canvas.width = SIZE * DPR;
canvas.height = SIZE * DPR;
context.scale(DPR, DPR);


const getStartingGrid = () => {
  let grid = [];
  for(let x = 0; x < GRID_WIDTH; x++){
    let column = [];
    for(let y = 0; y < GRID_WIDTH; y++){
      column.push(Math.random() > .5 ? 'white' : 'black');
    }
    grid.push(column);
  }
  return grid;
};

const drawGrid = (grid) => {
  grid.map((column, x) => {
    column.map((cell_color, y) => {
      context.save();
      context.fillStyle =  cell_color;
      context.translate(x * GRID_SIZE + MARGIN, y * GRID_SIZE + MARGIN)
      context.fillRect(0, 0, GRID_SIZE, GRID_SIZE)
      context.restore();
    })
  })
}

const getNeighbors = (grid, x, y) => {
  //const GRID_WIDTH = 3; // This is the little nugget that's wreaking conway
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

const blackToNumber = (color) => color == 'black'? 1:0;
const conwayReduceNeigbors = (neighbors) => {
  return blackToNumber(neighbors.north) +
    blackToNumber(neighbors.northEast) +
    blackToNumber(neighbors.east) +
    blackToNumber(neighbors.southEast) +
    blackToNumber(neighbors.south) +
    blackToNumber(neighbors.southWest) +
    blackToNumber(neighbors.west) +
    blackToNumber(neighbors.northWest);
}

const getNextConwayGrid = (lastGrid) => {
  const neighborCountGrid = lastGrid.map((column, x) => {
    return column.map((_, y) => {
      return conwayReduceNeigbors(getNeighbors(lastGrid, x, y));
    });
  })

  const colorGrid = neighborCountGrid.map((column, x) => {
    return column.map((cell_count, y) => {
      if(lastGrid[x][y] == ON){
        if(cell_count < 2 || cell_count > 3)
          return OFF;
        return ON;
      }
      if(cell_count == 3)
        return ON;
      return OFF;
    });
  })
  return colorGrid;
};

const getNextGrid = (lastGrid) => {
  lastGrid.unshift(lastGrid.pop());
  return lastGrid;
}

const draw = (lastGrid) => {
  context.globalCompositeOperation = 'destination-over';
  context.clearRect(0, 0, SIZE*DPR, SIZE*DPR);
  const nextGrid = getNextConwayGrid(lastGrid);
  drawGrid(nextGrid);
  setTimeout(() => {
    window.requestAnimationFrame(() => draw(nextGrid));
  }, 1000 / 10);
}

const init = () => {
  const startingGrid = getStartingGrid();
  window.requestAnimationFrame(() => draw(startingGrid));
};

init();
