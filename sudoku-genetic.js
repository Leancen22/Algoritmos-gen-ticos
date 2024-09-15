const sudokuGrid = document.getElementById("sudoku-grid");
const iterationsDiv = document.getElementById("iterations");
const topCandidatesTableBody = document.querySelector("#top-candidates-table tbody");
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const filledCellsInput = document.getElementById("filled-cells");

let puzzle = [];
let emptyCells = [];
let population = [];
let running = false;
const POP_SIZE = 100;
const MAX_ITERATIONS = 2000;

function initializeTable() {
    topCandidatesTableBody.innerHTML = '';

    for (let i = 1; i <= 10; i++) {
        const tr = document.createElement('tr');

        const rankTd = document.createElement('td');
        rankTd.textContent = i;
        tr.appendChild(rankTd);

        const gridTd = document.createElement('td');
        gridTd.textContent = '0, 0, 0, 0';
        tr.appendChild(gridTd);

        const fitnessTd = document.createElement('td');
        fitnessTd.textContent = '0';
        tr.appendChild(fitnessTd);

        topCandidatesTableBody.appendChild(tr);
    }
}

// function generateRandomSudoku(filledCellsCount) {
//   const baseSudoku = [
//     [1, 2, 3, 4],
//     [3, 4, 1, 2],
//     [2, 3, 4, 1],
//     [4, 1, 2, 3]
//   ];

//   let cellsToRemove = 16 - filledCellsCount;
//   const cellPositions = [];

//   for (let i = 0; i < 4; i++) {
//     for (let j = 0; j < 4; j++) {
//       cellPositions.push([i, j]);
//     }
//   }

//   while (cellsToRemove > 0) {
//     const randomIndex = Math.floor(Math.random() * cellPositions.length);
//     const [i, j] = cellPositions.splice(randomIndex, 1)[0];
//     baseSudoku[i][j] = 0;
//     cellsToRemove--;
//   }

//   return baseSudoku;
// }
function generateRandomSudoku(filledCellsCount) {
    const baseSudoku = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    solveSudoku(baseSudoku);

    const cellsToRemove = 16 - filledCellsCount;
    removeCells(baseSudoku, cellsToRemove);

    return baseSudoku;
}

function isValidNumber(sudoku, row, col, number) {
    for (let j = 0; j < 4; j++) {
        if (sudoku[row][j] === number) {
            return false;
        }
    }

    for (let i = 0; i < 4; i++) {
        if (sudoku[i][col] === number) {
            return false;
        }
    }

    const startRow = Math.floor(row / 2) * 2;
    const startCol = Math.floor(col / 2) * 2;
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            if (sudoku[startRow + i][startCol + j] === number) {
                return false;
            }
        }
    }

    return true;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function removeCells(sudoku, cellsToRemove) {
    const cellPositions = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            cellPositions.push([i, j]);
        }
    }

    shuffle(cellPositions);

    while (cellsToRemove > 0) {
        const [i, j] = cellPositions.pop();
        sudoku[i][j] = 0;
        cellsToRemove--;
    }
}

function solveSudoku(sudoku) {
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (sudoku[row][col] === 0) {
                const numbers = shuffle([1, 2, 3, 4]);
                for (const number of numbers) {
                    if (isValidNumber(sudoku, row, col, number)) {
                        sudoku[row][col] = number;

                        if (solveSudoku(sudoku)) {
                            return true;
                        }

                        sudoku[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function fillSudoku(sudoku, filledCellsCount) {
    if (filledCellsCount === 0) return true;

    const emptyPositions = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (sudoku[i][j] === 0) {
                emptyPositions.push([i, j]);
            }
        }
    }

    const shuffledPositions = shuffle(emptyPositions);

    for (const [i, j] of shuffledPositions) {
        const numbers = shuffle([1, 2, 3, 4]);
        for (const number of numbers) {
            if (isValidNumber(sudoku, i, j, number)) {
                sudoku[i][j] = number;
                filledCellsCount--;

                if (fillSudoku(sudoku, filledCellsCount)) {
                    return true;
                }

                sudoku[i][j] = 0;
                filledCellsCount++;
            }
        }

        return false;
    }

    return false;
}

function createValidSudoku() {
    const validSudoku = [
        [1, 2, 3, 4],
        [3, 4, 1, 2],
        [2, 3, 4, 1],
        [4, 1, 2, 3]
    ];

    return validSudoku;
}

function getEmptyCells(puzzle) {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (puzzle[i][j] === 0) {
                emptyCells.push([i, j]);
            }
        }
    }
    console.log('Celdas vacías (count):', emptyCells.length);
    return emptyCells;
}

function generateInitialPopulation() {
    population = [];

    for (let i = 0; i < POP_SIZE; i++) {
        const individual = {
            genes: emptyCells.map(() => Math.floor(Math.random() * 4) + 1),
            colors: emptyCells.map(() => candidateColors[Math.floor(Math.random() * candidateColors.length)])
        };

        if (individual.genes.length !== emptyCells.length) {
            console.error('El tamaño del individuo generado no coincide con el número de celdas vacías.');
        }

        population.push(individual);
    }
}

function createGridWithIndividual(individual) {
    sudokuGrid.innerHTML = '';

    if (!individual || !individual.genes || individual.genes.length !== emptyCells.length) {
        console.error('El individuo o los genes no están definidos o el tamaño no coincide con el número de celdas vacías.');
        return;
    }

    let idx = 0;

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const cellDiv = document.createElement('div');
        cellDiv.classList.add('sudoku-cell');

        if (puzzle[i][j] !== 0) {
          cellDiv.classList.add('fixed-cell');
          cellDiv.textContent = puzzle[i][j];
        } else {
          cellDiv.textContent = individual.genes[idx];
          idx++;
        }

        sudokuGrid.appendChild(cellDiv);
      }
    }
}

function restartSudoku() {
    running = false;

    const filledCellsCount = parseInt(filledCellsInput.value);
    puzzle = generateRandomSudoku(filledCellsCount);
    emptyCells = getEmptyCells(puzzle);

    const emptyIndividual = {
        genes: emptyCells.map(() => 0),
        colors: emptyCells.map(() => 'gray')
    };

    createGridWithIndividual(emptyIndividual);
    
    iterationsDiv.innerHTML = 'Generación: 0';
    topCandidatesTableBody.innerHTML = '';

    initializeTable();
}

function startAlgorithm() {
  if (running) return;
  running = true;
  generateInitialPopulation();
  runGeneticAlgorithm();
}

function selectParents() {
    const tournamentSize = 5;
    const parents = [];
  
    for (let i = 0; i < 2; i++) {
      const tournament = [];
  
      for (let j = 0; j < tournamentSize; j++) {
        const randomIndex = Math.floor(Math.random() * population.length);
        tournament.push(population[randomIndex]);
      }
  
      tournament.sort((a, b) => calculateFitness(a) - calculateFitness(b));
      parents.push(tournament[0]);
    }
  
    return parents;
}

function calculateFitness(individual) {
    let fitness = 0;
    const combinedSudoku = puzzle.map(row => row.slice());
    let idx = 0;

    emptyCells.forEach(([i, j]) => {
        combinedSudoku[i][j] = individual.genes[idx];
        idx++;
    });

    for (let i = 0; i < 4; i++) {
        const rowSet = new Set();
        for (let j = 0; j < 4; j++) {
            if (rowSet.has(combinedSudoku[i][j])) {
                fitness++;
            } else {
                rowSet.add(combinedSudoku[i][j]);
            }
        }
    }

    for (let j = 0; j < 4; j++) {
        const colSet = new Set();
        for (let i = 0; i < 4; i++) {
            if (colSet.has(combinedSudoku[i][j])) {
                fitness++;
            } else {
                colSet.add(combinedSudoku[i][j]);
            }
        }
    }

    for (let blockRow = 0; blockRow < 4; blockRow += 2) {
        for (let blockCol = 0; blockCol < 4; blockCol += 2) {
            const blockSet = new Set();
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    const value = combinedSudoku[blockRow + i][blockCol + j];
                    if (blockSet.has(value)) {
                        fitness++;
                    } else {
                        blockSet.add(value);
                    }
                }
            }
        }
    }

    return fitness;
}

function crossover(parent1, parent2, color1, color2) {
    const crossoverPoint = Math.floor(Math.random() * emptyCells.length);
  
    const parent1Genes = parent1.genes;
    const parent2Genes = parent2.genes;
  
    const child1Genes = parent1Genes.slice(0, crossoverPoint).concat(parent2Genes.slice(crossoverPoint));
    const child2Genes = parent2Genes.slice(0, crossoverPoint).concat(parent1Genes.slice(crossoverPoint));
  
    const child1Colors = new Array(crossoverPoint).fill(color1).concat(new Array(emptyCells.length - crossoverPoint).fill(color2));
    const child2Colors = new Array(crossoverPoint).fill(color2).concat(new Array(emptyCells.length - crossoverPoint).fill(color1));
  
    return [{ genes: child1Genes, colors: child1Colors }, { genes: child2Genes, colors: child2Colors }];
}

function mutate(individual) {
    const mutationRate = 0.2;
  
    for (let i = 0; i < individual.genes.length; i++) {
      if (Math.random() < mutationRate) {
        individual.genes[i] = Math.floor(Math.random() * 4) + 1;
        const [row, col] = emptyCells[i];
        colorCell(row, col, "black", 0);
      }
    }
  
    return individual;
}
  
function colorCell(row, col, colorClass, duration = 500) {
    const cellIndex = row * 4 + col;
    const cell = sudokuGrid.children[cellIndex];
  
    if (cell) {
      cell.classList.add(colorClass);
      if (duration > 0) {
        setTimeout(() => {
          cell.classList.remove(colorClass);
        }, duration);
      }
    } else {
      console.error(`La celda en la posición [${row}, ${col}] no existe.`);
    }
}

const candidateColors = [
    'red', 'blue', 'green', 'purple', 'orange', 'yellow', 'pink', 'brown', 'cyan', 'magenta'
];
  
function assignCandidateColors(population) {
    const coloredCandidates = population.slice(0, 10).map((candidate, index) => ({
        candidate,
        color: candidateColors[index]
    }));
    return coloredCandidates;
}

function displayTopCandidates(population) {
    topCandidatesTableBody.innerHTML = '';

    const coloredCandidates = assignCandidateColors(population);

    coloredCandidates.forEach(({ candidate, color }, index) => {
        const fitness = calculateFitness(candidate);

        if (fitness === Infinity) {
            console.error('Individuo con fitness infinito:', candidate.genes);
        }

        const tr = document.createElement('tr');

        const rankTd = document.createElement('td');
        rankTd.textContent = index + 1;
        tr.appendChild(rankTd);

        const gridTd = document.createElement('td');
        const coloredValues = candidate.genes.map((gene, idx) => {
            const isMutated = Math.random() < 0.1;
            const geneColor = isMutated ? 'black' : candidate.colors[idx];
            return `<span style="color: ${geneColor};">${gene}</span>`;
        }).join(', ');
        gridTd.innerHTML = coloredValues;
        tr.appendChild(gridTd);

        const fitnessTd = document.createElement('td');
        fitnessTd.textContent = fitness;
        tr.appendChild(fitnessTd);

        topCandidatesTableBody.appendChild(tr);
    });
}

function runGeneticAlgorithm() {
  let iteration = 0;

  function nextGeneration() {
    if (iteration >= MAX_ITERATIONS || !running) return;
  
    const [parent1, parent2] = selectParents();
    let [child1, child2] = crossover(parent1, parent2);
  
    child1 = mutate(child1);
    child2 = mutate(child2);
  
    population.push(child1, child2);
  
    population.sort((a, b) => calculateFitness(a) - calculateFitness(b));
  
    const bestFitness = calculateFitness(population[0]);
  
    createGridWithIndividual(population[0]);
  
    iterationsDiv.innerHTML = `Generación: ${iteration} - Mejor fitness: ${bestFitness}`;
    displayTopCandidates(population);
  
    if (bestFitness === 0) {
        createGridWithIndividual(population[0]);
        running = false;
        setTimeout(() => {
            alert("¡Solución encontrada!");
        }, 100);
        return;
    }
    iteration++;
    if (running) {
      setTimeout(nextGeneration, 100);
    }
  }
  

  nextGeneration();
}

startButton.addEventListener("click", startAlgorithm);
restartButton.addEventListener("click", restartSudoku);

restartSudoku();
