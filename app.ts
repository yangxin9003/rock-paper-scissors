// 定义石头剪刀布的类型
enum HandType {
    Rock = '👊🏻',
    Scissors = '✌🏻',
    Paper = '🖐🏻'
}

// 定义游戏状态
interface GameState {
    playerSlots: HandType[];
    enemySlots: HandType[];
    maxSwaps: number;
    swapsLeft: number;
    battleStarted: boolean;
    selectedSlots: number[];
}

// 获取DOM元素
const playerSlotsEl = document.getElementById('player-slots') as HTMLDivElement;
const enemySlotsEl = document.getElementById('enemy-slots') as HTMLDivElement;
const swapSlotsEl = document.getElementById('swap-slots') as HTMLDivElement;
const swapsLeftEl = document.getElementById('swaps-left') as HTMLSpanElement;
const battleLogEl = document.getElementById('battle-log-content') as HTMLDivElement;
const resultMessageEl = document.getElementById('result-message') as HTMLHeadingElement;

// 获取按钮元素
const shuffleBtn = document.getElementById('shuffle-btn') as HTMLButtonElement;
const swapBtn = document.getElementById('swap-btn') as HTMLButtonElement;
const startBattleBtn = document.getElementById('start-battle') as HTMLButtonElement;
const resetGameBtn = document.getElementById('reset-game') as HTMLButtonElement;
const confirmSwapBtn = document.getElementById('confirm-swap') as HTMLButtonElement;
const cancelSwapBtn = document.getElementById('cancel-swap') as HTMLButtonElement;
const closeResultBtn = document.getElementById('close-result') as HTMLButtonElement;

// 获取模态框元素
const swapModal = document.getElementById('swap-modal') as HTMLDivElement;
const resultModal = document.getElementById('result-modal') as HTMLDivElement;

// 初始化游戏状态
const gameState: GameState = {
    playerSlots: [],
    enemySlots: [],
    maxSwaps: 1, // 允许调整的次数
    swapsLeft: 0,
    battleStarted: false,
    selectedSlots: []
};

// 初始化游戏
function initGame(): void {
    // 清空之前的状态
    gameState.playerSlots = [];
    gameState.enemySlots = [];
    gameState.swapsLeft = gameState.maxSwaps;
    gameState.battleStarted = false;
    gameState.selectedSlots = [];

    // 更新显示
    swapsLeftEl.textContent = gameState.swapsLeft.toString();

    // 启用/禁用按钮
    shuffleBtn.disabled = false;
    swapBtn.disabled = true;
    startBattleBtn.disabled = true;

    // 清空战斗日志
    battleLogEl.innerHTML = '';

    // 清空槽位
    playerSlotsEl.innerHTML = '';
    enemySlotsEl.innerHTML = '';

    // 关闭可能打开的模态框
    swapModal.classList.remove('show');
    resultModal.classList.remove('show');
}

// 随机生成手势
function getRandomHand(): HandType {
    const hands = [HandType.Rock, HandType.Scissors, HandType.Paper];
    const randomIndex = Math.floor(Math.random() * hands.length);
    return hands[randomIndex];
}

// 随机生成槽位
function generateRandomSlots(): void {
    gameState.playerSlots = Array(4).fill(null).map(() => getRandomHand());
    gameState.enemySlots = Array(4).fill(null).map(() => getRandomHand());

    renderSlots();

    // 启用按钮
    swapBtn.disabled = gameState.swapsLeft <= 0;
    startBattleBtn.disabled = false;
}

// 渲染槽位
function renderSlots(): void {
    // 渲染玩家槽位
    playerSlotsEl.innerHTML = '';
    gameState.playerSlots.forEach((hand, index) => {
        const slotEl = document.createElement('div');
        slotEl.className = 'slot player-slot';
        slotEl.textContent = hand;
        slotEl.dataset.index = index.toString();
        playerSlotsEl.appendChild(slotEl);
    });

    // 渲染敌方槽位
    enemySlotsEl.innerHTML = '';
    gameState.enemySlots.forEach((hand, index) => {
        const slotEl = document.createElement('div');
        slotEl.className = 'slot enemy-slot';
        slotEl.textContent = hand;
        slotEl.dataset.index = index.toString();
        enemySlotsEl.appendChild(slotEl);
    });
}

// 渲染交换模态框中的槽位
function renderSwapSlots(): void {
    swapSlotsEl.innerHTML = '';
    gameState.playerSlots.forEach((hand, index) => {
        const slotEl = document.createElement('div');
        slotEl.className = 'slot swap-slot';
        slotEl.textContent = hand;
        slotEl.dataset.index = index.toString();

        // 如果已选中，添加selected类
        if (gameState.selectedSlots.includes(index)) {
            slotEl.classList.add('selected');
        }

        slotEl.addEventListener('click', () => selectSlotForSwap(index));
        swapSlotsEl.appendChild(slotEl);
    });
}

// 选择要交换的槽位
function selectSlotForSwap(index: number): void {
    const slotIndex = gameState.selectedSlots.indexOf(index);

    if (slotIndex > -1) {
        // 如果已经选中，则取消选中
        gameState.selectedSlots.splice(slotIndex, 1);
    } else {
        // 如果未选中且选中数量小于2，则添加
        if (gameState.selectedSlots.length < 2) {
            gameState.selectedSlots.push(index);
        } else {
            // 如果已经选中两个，替换第一个
            gameState.selectedSlots.shift();
            gameState.selectedSlots.push(index);
        }
    }

    // 更新UI
    renderSwapSlots();

    // 启用/禁用确认按钮
    confirmSwapBtn.disabled = gameState.selectedSlots.length !== 2;
}

// 交换槽位
function swapSlots(): void {
    if (gameState.selectedSlots.length !== 2) return;

    const [index1, index2] = gameState.selectedSlots;

    // 交换
    const temp = gameState.playerSlots[index1];
    gameState.playerSlots[index1] = gameState.playerSlots[index2];
    gameState.playerSlots[index2] = temp;

    // 减少剩余交换次数
    gameState.swapsLeft--;
    swapsLeftEl.textContent = gameState.swapsLeft.toString();

    // 更新UI
    renderSlots();

    // 关闭模态框
    swapModal.classList.remove('show');

    // 清空选中的槽位
    gameState.selectedSlots = [];

    // 更新按钮状态
    swapBtn.disabled = gameState.swapsLeft <= 0;
}

// 启动战斗
function startBattle(): void {
    if (gameState.playerSlots.length === 0 || gameState.enemySlots.length === 0) return;

    gameState.battleStarted = true;

    // 禁用按钮
    shuffleBtn.disabled = true;
    swapBtn.disabled = true;
    startBattleBtn.disabled = true;

    // 记录初始状态
    const initialPlayerSlots = [...gameState.playerSlots];
    const initialEnemySlots = [...gameState.enemySlots];

    // 添加战斗开始的日志
    addToBattleLog('战斗开始', 'round-header');
    addToBattleLog(`我方: ${initialPlayerSlots.join(' ')}`, 'log-entry');
    addToBattleLog(`敌方: ${initialEnemySlots.join(' ')}`, 'log-entry');

    // 开始回合制战斗
    processBattle();
}

// 添加日志
function addToBattleLog(message: string, className: string = ''): void {
    const logEntry = document.createElement('div');
    logEntry.className = className;
    logEntry.textContent = message;
    battleLogEl.appendChild(logEntry);

    // 自动滚动到底部
    battleLogEl.scrollTop = battleLogEl.scrollHeight;
}

// 处理战斗逻辑
function processBattle(): void {
    let currentPlayerSlots = [...gameState.playerSlots];
    let currentEnemySlots = [...gameState.enemySlots];

    let round = 1;
    let battleResult = '';

    // 模拟回合制战斗
    while (currentPlayerSlots.length > 0 && currentEnemySlots.length > 0) {
        addToBattleLog(`回合 ${round}`, 'round-header');

        // 获取当前回合的第一手
        const playerHand = currentPlayerSlots[0];
        const enemyHand = currentEnemySlots[0];

        // 判断胜负
        const result = determineWinner(playerHand, enemyHand);

        // 根据结果移除手牌
        if (result === 'win') {
            addToBattleLog(`我方的 ${playerHand} 胜过了敌方的 ${enemyHand}`, 'log-entry');
            currentEnemySlots.shift(); // 敌方失去这一手
        } else if (result === 'lose') {
            addToBattleLog(`我方的 ${playerHand} 输给了敌方的 ${enemyHand}`, 'log-entry');
            currentPlayerSlots.shift(); // 我方失去这一手
        } else {
            addToBattleLog(`我方的 ${playerHand} 和敌方的 ${enemyHand} 打成平手`, 'log-entry');
            currentPlayerSlots.shift(); // 双方都失去这一手
            currentEnemySlots.shift();
        }

        // 显示当前状态
        addToBattleLog(`我方剩余: ${currentPlayerSlots.join(' ')}`, 'log-entry');
        addToBattleLog(`敌方剩余: ${currentEnemySlots.join(' ')}`, 'log-entry');

        round++;
    }

    // 确定最终胜负
    if (currentPlayerSlots.length > 0 && currentEnemySlots.length === 0) {
        battleResult = '我方胜利！';
    } else if (currentPlayerSlots.length === 0 && currentEnemySlots.length > 0) {
        battleResult = '敌方胜利！';
    } else {
        battleResult = '平局！';
    }

    // 显示结果
    addToBattleLog(battleResult, 'round-header');

    // 显示结果模态框
    resultMessageEl.textContent = battleResult;
    resultModal.classList.add('show');

    // 更新游戏状态
    gameState.playerSlots = currentPlayerSlots;
    gameState.enemySlots = currentEnemySlots;

    // 渲染最终状态
    renderSlots();
}

// 判断胜负
function determineWinner(playerHand: HandType, enemyHand: HandType): string {
    if (playerHand === enemyHand) {
        return 'draw';
    }

    if (
        (playerHand === HandType.Rock && enemyHand === HandType.Scissors) ||
        (playerHand === HandType.Scissors && enemyHand === HandType.Paper) ||
        (playerHand === HandType.Paper && enemyHand === HandType.Rock)
    ) {
        return 'win';
    }

    return 'lose';
}

// 事件监听器
shuffleBtn.addEventListener('click', generateRandomSlots);

swapBtn.addEventListener('click', () => {
    // 重置选中状态
    gameState.selectedSlots = [];

    // 渲染交换模态框中的槽位
    renderSwapSlots();

    // 显示交换模态框
    swapModal.classList.add('show');

    // 禁用确认按钮
    confirmSwapBtn.disabled = true;
});

confirmSwapBtn.addEventListener('click', swapSlots);

cancelSwapBtn.addEventListener('click', () => {
    swapModal.classList.remove('show');
    gameState.selectedSlots = [];
});

startBattleBtn.addEventListener('click', startBattle);

resetGameBtn.addEventListener('click', initGame);

closeResultBtn.addEventListener('click', () => {
    resultModal.classList.remove('show');

    // 重置游戏
    initGame();
});

// 初始化游戏
initGame();
