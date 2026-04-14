export interface BoardCell {
    cardId: string | null;
    owner: 'p1' | 'p2' | null;
}

export interface GameMoveResult {
    updatedBoard: BoardCell[];
    flippedCells: number[];
}

export interface CardNumbers {
    top: string;
    left: string;
    right: string;
    bottom: string;
}

export interface GameState {
    board: BoardCell[];
    players: {
        p1: { username: string, deck: string[] };
        p2: { username: string, deck: string[] };
    };
    currentTurn: 'p1' | 'p2';
    rules: string[];
    status: 'waiting' | 'in_progress' | 'finished';
    winner: 'p1' | 'p2' | 'draw' | null;
}

export class GameEngine {

    static parseValue(value: string): number {
        if (value === 'A') return 10;
        return parseInt(value) || 0;
    }
    
    static processMove(board: BoardCell[], cellIndex: number, cardIndex: string, playerRole: 'p1' | 'p2', activeRules: string[], cardsDict: Record<string, CardNumbers>): GameMoveResult {
        
        const newBoard = [...board];
        newBoard[cellIndex] = { cardId: cardIndex, owner: playerRole };

        const flippedCells = this.applyBasicFlip(newBoard, cellIndex, playerRole, cardsDict);

        return {
            updatedBoard: newBoard,
            flippedCells: flippedCells
        };
    }

    static applyBasicFlip(board: BoardCell[], cellIndex: number, playerRole: 'p1' | 'p2', cardsDict: Record<string, CardNumbers>): number[] {
        const flippedCells: number[] = [];
        const playedCardStats = cardsDict[board[cellIndex]?.cardId!];

        if (!playedCardStats) return [];

        const x = cellIndex % 3;
        const y = Math.floor(cellIndex / 3);

        const checks = [
            { nx: x, ny: y - 1, dir: 'top', oppDir: 'bottom' },
            { nx: x - 1, ny: y, dir: 'left', oppDir: 'right' },
            { nx: x + 1, ny: y, dir: 'right', oppDir: 'left' },
            { nx: x, ny: y + 1, dir: 'bottom', oppDir: 'top' }
        ];

        for (const check of checks) {
            if (check.nx >= 0 && check.nx < 3 && check.ny >= 0 && check.ny < 3) {
                const neighborIndex = check.ny * 3 + check.nx;
                const neighborCell = board[neighborIndex];

                if (neighborCell?.owner && neighborCell.owner !== playerRole && neighborCell.cardId) {
                    const neighborCardStats = cardsDict[neighborCell.cardId];

                    if (neighborCardStats) {
                        const playedValue = this.parseValue(playedCardStats[check.dir as keyof CardNumbers]);
                        const neighborValue = this.parseValue(neighborCardStats[check.oppDir as keyof CardNumbers]);

                        if (playedValue > neighborValue) {
                            if (board[neighborIndex]) {
                                board[neighborIndex].owner = playerRole;
                                flippedCells.push(neighborIndex);
                            }
                        }
                    }
                }
            }
        }
        return flippedCells;
    }

    static checkEndGame(board: BoardCell[]): boolean {
        return board.every(cell => cell.owner !== null);
    }

    static detemineWinner(board: BoardCell[], players: any): { status: 'finished', winner: 'p1' | 'p2' | 'draw' } {
        const counts = { p1: 0, p2: 0 };
        board.forEach(cell => {
            if (cell.owner === 'p1') counts.p1++;
            else if (cell.owner === 'p2') counts.p2++;
        });

        if (players.p1.deck.length > 0) counts.p1++;
        if (players.p2.deck.length > 0) counts.p2++;

        if (counts.p1 > counts.p2) {
            return { status: 'finished', winner: 'p1' };
        } else if (counts.p2 > counts.p1) {
            return { status: 'finished', winner: 'p2' };
        } else {
            return { status: 'finished', winner: 'draw' };
        }
    }
}