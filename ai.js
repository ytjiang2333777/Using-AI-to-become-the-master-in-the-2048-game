class AI2048 {
    constructor(game) {
        this.game = game;
        this.isPlaying = false;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('ai-play').addEventListener('click', () => this.startPlaying());
        document.getElementById('ai-stop').addEventListener('click', () => this.stopPlaying());
    }

    async startPlaying() {
        this.isPlaying = true;
        while (this.isPlaying) {
            const move = this.getBestMove();
            if (!move) break;
            
            this.game.handleKeyPress({key: move, preventDefault: () => {}});
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    stopPlaying() {
        this.isPlaying = false;
    }

    getBestMove() {
        const moves = this.game.getAvailableMoves();
        if (moves.length === 0) return null;

        let bestScore = -Infinity;
        let bestMove = null;

        moves.forEach(move => {
            const gridCopy = JSON.parse(JSON.stringify(this.game.grid));
            const scoreCopy = this.game.score;
            
            this.game.handleKeyPress({key: move, preventDefault: () => {}});
            const score = this.evaluatePosition();
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
            
            this.game.grid = gridCopy;
            this.game.score = scoreCopy;
        });

        return bestMove;
    }

    evaluatePosition() {
        let score = 0;
        
        // 评估空格数量
        const emptyCells = this.game.grid.flat().filter(cell => cell === 0).length;
        score += emptyCells * 10;

        // 评估数字的单调性
        score += this.getMonotonicityScore() * 20;

        // 评估相邻数字的相似度
        score += this.getSmoothness() * 10;

        // 考虑大数字在角落的情况
        if (this.game.grid[0][0] === Math.max(...this.game.grid.flat())) {
            score += 100;
        }

        return score;
    }

    getMonotonicityScore() {
        let score = 0;
        
        // 检查行的单调性
        for (let i = 0; i < 4; i++) {
            let isIncreasing = true;
            let isDecreasing = true;
            
            for (let j = 1; j < 4; j++) {
                if (this.game.grid[i][j] < this.game.grid[i][j-1]) isIncreasing = false;
                if (this.game.grid[i][j] > this.game.grid[i][j-1]) isDecreasing = false;
            }
            
            score += isIncreasing || isDecreasing ? 1 : 0;
        }

        // 检查列的单调性
        for (let j = 0; j < 4; j++) {
            let isIncreasing = true;
            let isDecreasing = true;
            
            for (let i = 1; i < 4; i++) {
                if (this.game.grid[i][j] < this.game.grid[i-1][j]) isIncreasing = false;
                if (this.game.grid[i][j] > this.game.grid[i-1][j]) isDecreasing = false;
            }
            
            score += isIncreasing || isDecreasing ? 1 : 0;
        }

        return score;
    }

    getSmoothness() {
        let smoothness = 0;
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.game.grid[i][j] !== 0) {
                    if (i < 3 && this.game.grid[i+1][j] !== 0) {
                        smoothness -= Math.abs(Math.log2(this.game.grid[i][j]) - Math.log2(this.game.grid[i+1][j]));
                    }
                    if (j < 3 && this.game.grid[i][j+1] !== 0) {
                        smoothness -= Math.abs(Math.log2(this.game.grid[i][j]) - Math.log2(this.game.grid[i][j+1]));
                    }
                }
            }
        }
        
        return smoothness;
    }
}

const ai = new AI2048(game); 