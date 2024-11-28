class Game2048 {
    constructor() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        this.setupGrid();
        this.setupEventListeners();
        this.addNewTile();
        this.addNewTile();
        this.updateDisplay();
    }

    setupGrid() {
        const gridElement = document.querySelector('.grid');
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            gridElement.appendChild(cell);
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('new-game').addEventListener('click', () => this.resetGame());
    }

    handleKeyPress(event) {
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        
        const oldGrid = JSON.stringify(this.grid);
        
        switch(event.key) {
            case 'ArrowUp': this.moveUp(); break;
            case 'ArrowDown': this.moveDown(); break;
            case 'ArrowLeft': this.moveLeft(); break;
            case 'ArrowRight': this.moveRight(); break;
        }

        if (oldGrid !== JSON.stringify(this.grid)) {
            this.addNewTile();
            this.updateDisplay();
        }
    }

    moveLine(line) {
        const nonZero = line.filter(cell => cell !== 0);
        const merged = [];
        
        for (let i = 0; i < nonZero.length; i++) {
            if (i < nonZero.length - 1 && nonZero[i] === nonZero[i + 1]) {
                merged.push(nonZero[i] * 2);
                this.score += nonZero[i] * 2;
                i++;
            } else {
                merged.push(nonZero[i]);
            }
        }
        
        return merged.concat(Array(4 - merged.length).fill(0));
    }

    moveLeft() {
        this.grid = this.grid.map(row => this.moveLine(row));
    }

    moveRight() {
        this.grid = this.grid.map(row => this.moveLine(row.reverse()).reverse());
    }

    moveUp() {
        this.rotateGrid();
        this.moveRight();
        this.rotateGrid(3);
    }

    moveDown() {
        this.rotateGrid();
        this.moveLeft();
        this.rotateGrid(3);
    }

    rotateGrid(times = 1) {
        for (let t = 0; t < times; t++) {
            const newGrid = Array(4).fill().map(() => Array(4).fill(0));
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    newGrid[j][3-i] = this.grid[i][j];
                }
            }
            this.grid = newGrid;
        }
    }

    addNewTile() {
        const emptyCells = [];
        this.grid.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (cell === 0) emptyCells.push([i, j]);
            });
        });

        if (emptyCells.length > 0) {
            const [i, j] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[i][j] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    updateDisplay() {
        const cells = document.querySelectorAll('.cell');
        this.grid.flat().forEach((value, index) => {
            cells[index].className = `cell ${value ? 'cell-' + value : ''}`;
            cells[index].textContent = value || '';
        });

        document.getElementById('score').textContent = this.score;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore);
        }
        document.getElementById('best-score').textContent = this.bestScore;
    }

    resetGame() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.addNewTile();
        this.addNewTile();
        this.updateDisplay();
    }

    getAvailableMoves() {
        const moves = [];
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].forEach(move => {
            const gridCopy = JSON.parse(JSON.stringify(this.grid));
            this.handleKeyPress({key: move, preventDefault: () => {}});
            if (JSON.stringify(gridCopy) !== JSON.stringify(this.grid)) {
                moves.push(move);
            }
            this.grid = gridCopy;
        });
        return moves;
    }
}

const game = new Game2048(); 