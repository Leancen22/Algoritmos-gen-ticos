let targetWord = "";
const alphabet = "abcdefghijklmnopqrstuvwxyzñáéíóú_+=-*/<>.,;:!?¿¡'()[]{}0123456789";
const POP_SIZE = 100;
const MAX_GENERATIONS = 2000; 
const MUTATION_RATE = 0.1;
let population = [];
let generation = 0;
let running = true;

const outputGeneration = document.getElementById('generation');
const outputBestWord = document.getElementById('best-word');
const outputFitness = document.getElementById('fitness');
const startButton = document.getElementById('start-button');
const targetWordInput = document.getElementById('target-word-input');
const populationTableBody = document.querySelector("#population-table tbody");

function generateRandomWord(length) {
    let word = "";
    for (let i = 0; i < length; i++) {
        const randomChar = alphabet[Math.floor(Math.random() * alphabet.length)];
        word += randomChar;
    }
    return word;
}

function calculateFitness(word) {
    let fitness = 0;
    for (let i = 0; i < word.length; i++) {
        if (word[i] === targetWord[i]) {
            fitness++;
        }
    }
    return fitness;
}

function generateInitialPopulation() {
    population = [];
    for (let i = 0; i < POP_SIZE; i++) {
        const individual = generateRandomWord(targetWord.length);
        population.push(individual);
    }
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
        tournament.sort((a, b) => calculateFitness(b) - calculateFitness(a));
        parents.push(tournament[0]);
    }

    return parents;
}

function crossover(parent1, parent2) {
    const crossoverPoint = Math.floor(Math.random() * targetWord.length);
    const child1 = parent1.slice(0, crossoverPoint) + parent2.slice(crossoverPoint);
    const child2 = parent2.slice(0, crossoverPoint) + parent1.slice(crossoverPoint);
    return [child1, child2];
}

function mutate(individual) {
    let mutatedIndividual = "";
    for (let i = 0; i < individual.length; i++) {
        if (Math.random() < MUTATION_RATE) {
            const randomChar = alphabet[Math.floor(Math.random() * alphabet.length)];
            mutatedIndividual += randomChar;
        } else {
            mutatedIndividual += individual[i];
        }
    }
    return mutatedIndividual;
}

function generateNextGeneration() {
    const newPopulation = [];
    while (newPopulation.length < POP_SIZE) {
        const [parent1, parent2] = selectParents();
        let [child1, child2] = crossover(parent1, parent2);

        child1 = mutate(child1);
        child2 = mutate(child2);

        newPopulation.push(child1, child2);
    }
    population = newPopulation.slice(0, POP_SIZE);
}

function updatePopulationTable() {
    populationTableBody.innerHTML = "";

    const sortedPopulation = population.slice().sort((a, b) => calculateFitness(b) - calculateFitness(a));

    sortedPopulation.forEach((individual, index) => {
        const fitness = calculateFitness(individual);

        const tr = document.createElement("tr");

        const tdRank = document.createElement("td");
        tdRank.textContent = index + 1;
        tr.appendChild(tdRank);

        const tdWord = document.createElement("td");
        tdWord.textContent = individual;
        tr.appendChild(tdWord);

        const tdFitness = document.createElement("td");
        tdFitness.textContent = fitness;
        tr.appendChild(tdFitness);

        populationTableBody.appendChild(tr);
    });
}

function runGeneticAlgorithm() {
    generateInitialPopulation();
    running = true;
    generation = 0;

    function nextGeneration() {
        if (!running || generation >= MAX_GENERATIONS) return;

        const bestIndividual = population.reduce((best, current) => {
            return calculateFitness(current) > calculateFitness(best) ? current : best;
        }, population[0]);

        const bestFitness = calculateFitness(bestIndividual);

        outputGeneration.innerHTML = `Generación: ${generation}`;
        outputBestWord.innerHTML = `Mejor palabra: ${bestIndividual}`;
        outputFitness.innerHTML = `Fitness: ${bestFitness}`;

        updatePopulationTable();

        if (bestFitness === targetWord.length) {
            updatePopulationTable();
            running = false;
            setTimeout(() => {
                alert(`¡Palabra encontrada: ${bestIndividual}!`);
            }, 100);
            return;
        }

        generateNextGeneration();
        generation++;

        setTimeout(nextGeneration, 100);
    }

    nextGeneration();
}

startButton.addEventListener("click", function () {
    targetWord = targetWordInput.value.toLowerCase();
    if (targetWord.length === 0) {
        alert("Por favor, escribe una palabra válida.");
        return;
    }
    runGeneticAlgorithm();
});
