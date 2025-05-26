// 定义石头剪刀布的类型
export enum HandType {
    Rock = '👊🏻',
    Scissors = '✌🏻',
    Paper = '🖐🏻',
    Masked = '❓'
}

// 定义游戏状态
export interface GameState {
    playerSlots: HandType[];
    enemySlots: HandType[];
    maxSwaps: number;
    swapsLeft: number;
    battleStarted: boolean;
    selectedSlots: number[];
    animationInProgress: boolean;
    battleLog: Array<{message: string, className?: string}>;
    level: number;
    playerHP: number;
    enemyHP: number;
    maxPlayerHP: number;
    maxEnemyHP: number;
    gameOver: boolean;
    canContinue: boolean;
    // 遮罩相关
    maskedEnemySlots: HandType[];
    revealMasks: boolean;
}

// 定义战斗回合数据
export interface BattleRound {
    round: number;
    playerHand: HandType;
    enemyHand: HandType;
    result: string;
    remainingPlayerHands: HandType[];
    remainingEnemyHands: HandType[];
}

// 定义战斗结果
export interface BattleResult {
    playerWins: number;
    enemyWins: number;
    draws: number;
    winner: 'player' | 'enemy' | 'draw';
    playerHP: number;
    enemyHP: number;
    level: number;
    gameOver: boolean;
    nextLevel: boolean;
    canContinue: boolean;
}
