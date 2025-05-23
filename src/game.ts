// 定义石头剪刀布的类型
export enum HandType {
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
    animationInProgress: boolean;
}

// 全局游戏状态
const gameState: GameState = {
    playerSlots: [],
    enemySlots: [],
    maxSwaps: 1, // 允许调整的次数
    swapsLeft: 0,
    battleStarted: false,
    selectedSlots: [],
    animationInProgress: false
};

// DOM 元素引用
let playerSlotsEl: HTMLDivElement;
let enemySlotsEl: HTMLDivElement;
let swapSlotsEl: HTMLDivElement;
let swapsLeftEl: HTMLSpanElement;
let battleLogEl: HTMLDivElement;
let resultMessageEl: HTMLHeadingElement;

// 按钮元素引用
let shuffleBtn: HTMLButtonElement;
let swapBtn: HTMLButtonElement;
let startBattleBtn: HTMLButtonElement;
let resetGameBtn: HTMLButtonElement;
let confirmSwapBtn: HTMLButtonElement;
let cancelSwapBtn: HTMLButtonElement;
let closeResultBtn: HTMLButtonElement;

// 模态框元素引用
let swapModal: HTMLDivElement;
let resultModal: HTMLDivElement;

// 动画元素引用
let battleAnimationContainer: HTMLDivElement;

// 初始化游戏
export function initGame(): void {
    // 获取 DOM 元素
    playerSlotsEl = document.getElementById('player-slots') as HTMLDivElement;
    enemySlotsEl = document.getElementById('enemy-slots') as HTMLDivElement;
    swapSlotsEl = document.getElementById('swap-slots') as HTMLDivElement;
    swapsLeftEl = document.getElementById('swaps-left') as HTMLSpanElement;
    battleLogEl = document.getElementById('battle-log-content') as HTMLDivElement;
    resultMessageEl = document.getElementById('result-message') as HTMLHeadingElement;

    // 获取按钮元素
    shuffleBtn = document.getElementById('shuffle-btn') as HTMLButtonElement;
    swapBtn = document.getElementById('swap-btn') as HTMLButtonElement;
    startBattleBtn = document.getElementById('start-battle') as HTMLButtonElement;
    resetGameBtn = document.getElementById('reset-game') as HTMLButtonElement;
    confirmSwapBtn = document.getElementById('confirm-swap') as HTMLButtonElement;
    cancelSwapBtn = document.getElementById('cancel-swap') as HTMLButtonElement;
    closeResultBtn = document.getElementById('close-result') as HTMLButtonElement;

    // 获取模态框元素
    swapModal = document.getElementById('swap-modal') as HTMLDivElement;
    resultModal = document.getElementById('result-modal') as HTMLDivElement;

    // 获取动画容器
    battleAnimationContainer = document.getElementById('battle-animation-container') as HTMLDivElement;

    // 添加事件监听器
    setupEventListeners();

    // 重置游戏状态
    resetGame();
}

// 设置事件监听器
function setupEventListeners(): void {
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

    resetGameBtn.addEventListener('click', resetGame);

    closeResultBtn.addEventListener('click', () => {
        resultModal.classList.remove('show');

        // 不再自动重置游戏，只关闭结果模态框
        // 启用重新开始按钮，禁用其他功能按钮
        resetGameBtn.disabled = false;
        shuffleBtn.disabled = true;
        swapBtn.disabled = true;
        startBattleBtn.disabled = true;
    });

    // 为动画容器添加点击事件，点击关闭动画
    battleAnimationContainer.addEventListener('click', () => {
        if (gameState.animationInProgress) {
            hideAnimation();
            continueProcessing();
        }
    });
}

// 重置游戏
function resetGame(): void {
    // 清空之前的状态
    gameState.playerSlots = [];
    gameState.enemySlots = [];
    gameState.swapsLeft = gameState.maxSwaps;
    gameState.battleStarted = false;
    gameState.selectedSlots = [];
    gameState.animationInProgress = false;

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
    hideAnimation();
}

// 隐藏动画
function hideAnimation(): void {
    // 隐藏动画容器
    battleAnimationContainer.classList.remove('show');

    gameState.animationInProgress = false;
}

// 继续处理战斗
let processingQueue: Array<() => void> = [];

function continueProcessing(): void {
    if (processingQueue.length > 0) {
        const nextProcess = processingQueue.shift();
        if (nextProcess) {
            nextProcess();
        }
    }
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
    processBattleWithAnimation();
}

// 添加日志
function addToBattleLog(message: string, className: string = ''): void {
    const logEntry = document.createElement('div');
    logEntry.className = className;

    // 根据消息内容添加额外的样式类
    if (message.includes('====')) {
        logEntry.classList.add('log-divider');
    }

    if (message.includes('我方胜利')) {
        logEntry.classList.add('win-result');
    } else if (message.includes('敌方胜利')) {
        logEntry.classList.add('lose-result');
    } else if (message.includes('平局')) {
        logEntry.classList.add('draw-result');
    }

    if (message.includes('胜过了')) {
        logEntry.classList.add('win-result');
    } else if (message.includes('输给了')) {
        logEntry.classList.add('lose-result');
    } else if (message.includes('平手')) {
        logEntry.classList.add('draw-result');
    }

    logEntry.textContent = message;
    battleLogEl.appendChild(logEntry);

    // 自动滚动到底部
    battleLogEl.scrollTop = battleLogEl.scrollHeight;
}

// 处理战斗逻辑（带动画）
function processBattleWithAnimation(): void {
    // 重置处理队列，确保每次战斗开始时队列为空
    processingQueue = [];

    // 创建战斗队列（每回合一个处理函数）
    let currentPlayerSlots = [...gameState.playerSlots];
    let currentEnemySlots = [...gameState.enemySlots];
    let round = 1;

    // 记录战斗步骤
    addToBattleLog('==== 详细对战过程 ====', 'round-header');

    // 为每个回合创建处理函数并添加到队列
    while (currentPlayerSlots.length > 0 && currentEnemySlots.length > 0) {
        // 创建回合的副本
        const currentRound = round;
        const playerHand = currentPlayerSlots[0];
        const enemyHand = currentEnemySlots[0];
        const currentPlayerSlotsCopy = [...currentPlayerSlots];
        const currentEnemySlotsCopy = [...currentEnemySlots];

        // 创建回合处理函数
        const processRound = () => {
            // 处理当前回合
            addToBattleLog(`回合 ${currentRound}`, 'round-header');

            // 判断胜负
            const result = determineWinner(playerHand, enemyHand);

            // 显示动画，同时展示两方的完整队列
            showBattleAnimation(playerHand, enemyHand, result, currentPlayerSlotsCopy, currentEnemySlotsCopy);

            // 设置处理后的回调，在动画结束后执行
            processingQueue.push(() => {
                // 根据结果移除手牌
                if (result === 'win') {
                    addToBattleLog(`我方的 ${playerHand} 胜过了敌方的 ${enemyHand}`, 'log-entry');
                    currentPlayerSlots.forEach((hand, index) => {
                        if (index === 0) {
                            // 标记第一个手势为胜利
                            const slotEl = playerSlotsEl.querySelector(`.player-slot[data-index="${index}"]`);
                            if (slotEl) {
                                slotEl.classList.add('win');
                                setTimeout(() => slotEl.classList.remove('win'), 1000);
                            }
                        }
                    });

                    currentEnemySlots.shift(); // 敌方失去这一手

                    // 更新敌方槽位显示
                    renderSlots();
                } else if (result === 'lose') {
                    addToBattleLog(`我方的 ${playerHand} 输给了敌方的 ${enemyHand}`, 'log-entry');
                    currentPlayerSlots.shift(); // 我方失去这一手

                    // 更新我方槽位显示
                    renderSlots();
                } else {
                    addToBattleLog(`我方的 ${playerHand} 和敌方的 ${enemyHand} 打成平手`, 'log-entry');
                    currentPlayerSlots.shift(); // 双方都失去这一手
                    currentEnemySlots.shift();

                    // 更新双方槽位显示
                    renderSlots();
                }

                // 显示当前状态
                addToBattleLog(`我方剩余: ${currentPlayerSlots.join(' ')}`, 'log-entry');
                addToBattleLog(`敌方剩余: ${currentEnemySlots.join(' ')}`, 'log-entry');
                addToBattleLog('------------------------', 'log-entry');

                // 检查是否战斗结束
                if (currentPlayerSlots.length === 0 || currentEnemySlots.length === 0) {
                    finalizeBattle();
                }
            });
        };

        // 添加到处理队列
        processingQueue.push(processRound);

        // 预先处理结果，以便能够提前知道剩余手牌
        const result = determineWinner(playerHand, enemyHand);
        if (result === 'win') {
            currentEnemySlots.shift();
        } else if (result === 'lose') {
            currentPlayerSlots.shift();
        } else {
            currentPlayerSlots.shift();
            currentEnemySlots.shift();
        }

        round++;
    }

    // 添加最终结果处理函数
    function finalizeBattle() {
        // 确定最终胜负
        let battleResult = '';
        if (currentPlayerSlots.length > 0 && currentEnemySlots.length === 0) {
            battleResult = '我方胜利！';
        } else if (currentPlayerSlots.length === 0 && currentEnemySlots.length > 0) {
            battleResult = '敌方胜利！';
        } else {
            battleResult = '平局！';
        }

        // 显示结果
        addToBattleLog('==== 最终结果 ====', 'round-header');
        addToBattleLog(battleResult, 'round-header');
        if (currentPlayerSlots.length > 0) {
            addToBattleLog(`我方剩余手牌: ${currentPlayerSlots.join(' ')}`, 'log-entry');
        } else {
            addToBattleLog('我方无剩余手牌', 'log-entry');
        }

        if (currentEnemySlots.length > 0) {
            addToBattleLog(`敌方剩余手牌: ${currentEnemySlots.join(' ')}`, 'log-entry');
        } else {
            addToBattleLog('敌方无剩余手牌', 'log-entry');
        }

        // 显示结果模态框
        resultMessageEl.textContent = battleResult;
        resultModal.classList.add('show');

        // 更新游戏状态
        gameState.playerSlots = currentPlayerSlots;
        gameState.enemySlots = currentEnemySlots;

        // 渲染最终状态
        renderSlots();

        // 启用重新开始按钮
        resetGameBtn.disabled = false;
    }

    // 开始处理第一个回合
    if (processingQueue.length > 0) {
        const firstProcess = processingQueue.shift();
        if (firstProcess) {
            firstProcess();
        }
    }
}

// 显示更复杂的战斗动画，展示双方的队列
function showBattleAnimation(playerHand: HandType, enemyHand: HandType, result: string,
                            playerSlots: HandType[], enemySlots: HandType[]): void {
    gameState.animationInProgress = true;

    // 清理之前的动画状态
    battleAnimationContainer.innerHTML = '';

    // 创建战斗舞台
    const battleStage = document.createElement('div');
    battleStage.className = 'battle-stage';

    // 创建玩家队列区域
    const playerQueueContainer = document.createElement('div');
    playerQueueContainer.className = 'queue-container player-queue';

    // 创建敌方队列区域
    const enemyQueueContainer = document.createElement('div');
    enemyQueueContainer.className = 'queue-container enemy-queue';

    // 创建战斗区域
    const battleArea = document.createElement('div');
    battleArea.className = 'battle-area';

    // 创建双方当前对战的手势
    const playerHandEl = document.createElement('div');
    playerHandEl.className = 'battle-hand player-hand';
    playerHandEl.textContent = playerHand;

    const enemyHandEl = document.createElement('div');
    enemyHandEl.className = 'battle-hand enemy-hand';
    enemyHandEl.textContent = enemyHand;

    // 创建碰撞效果
    const battleEffect = document.createElement('div');
    battleEffect.className = 'battle-effect';

    // 创建结果显示
    const battleResult = document.createElement('div');
    battleResult.className = 'battle-result';

    // 添加到战斗区域
    battleArea.appendChild(playerHandEl);
    battleArea.appendChild(battleEffect);
    battleArea.appendChild(enemyHandEl);
    battleArea.appendChild(battleResult);

    // 渲染队列元素
    playerSlots.forEach((hand, index) => {
        const slotEl = document.createElement('div');
        slotEl.className = 'queue-slot player-queue-slot';
        slotEl.textContent = hand;

        // 标记当前对战的手势
        if (index === 0) {
            slotEl.classList.add('current');
        }

        playerQueueContainer.appendChild(slotEl);
    });

    enemySlots.forEach((hand, index) => {
        const slotEl = document.createElement('div');
        slotEl.className = 'queue-slot enemy-queue-slot';
        slotEl.textContent = hand;

        // 标记当前对战的手势
        if (index === 0) {
            slotEl.classList.add('current');
        }

        enemyQueueContainer.appendChild(slotEl);
    });

    // 组装战斗舞台
    battleStage.appendChild(playerQueueContainer);
    battleStage.appendChild(battleArea);
    battleStage.appendChild(enemyQueueContainer);

    // 添加到容器
    battleAnimationContainer.appendChild(battleStage);

    // 根据结果设置效果
    let effectIcon = '💥';
    let resultText = '';

    if (result === 'win') {
        effectIcon = '✨';
        resultText = '我方获胜';
        playerHandEl.classList.add('win');
        enemyHandEl.classList.add('lose');
    } else if (result === 'lose') {
        effectIcon = '💥';
        resultText = '敌方获胜';
        playerHandEl.classList.add('lose');
        enemyHandEl.classList.add('win');
    } else {
        effectIcon = '🔄';
        resultText = '平局';
        playerHandEl.classList.add('draw');
        enemyHandEl.classList.add('draw');
    }

    battleEffect.textContent = effectIcon;
    battleResult.textContent = resultText;

    // 显示动画容器
    battleAnimationContainer.classList.add('show');

    // 添加动画类
    setTimeout(() => {
        playerHandEl.classList.add('animate');
        enemyHandEl.classList.add('animate');
    }, 100);

    // 添加移动动画类
    setTimeout(() => {
        playerHandEl.classList.remove('animate');
        enemyHandEl.classList.remove('animate');
        playerHandEl.classList.add('player-hand', 'animate');
        enemyHandEl.classList.add('enemy-hand', 'animate');
    }, 600);

    // 显示碰撞效果
    setTimeout(() => {
        battleEffect.classList.add('show');
    }, 1200);

    // 显示结果
    setTimeout(() => {
        battleResult.classList.add('show');
    }, 1500);

    // 更新队列显示
    setTimeout(() => {
        // 根据结果更新队列
        if (result === 'win') {
            // 敌方第一个元素消失
            const firstEnemySlot = enemyQueueContainer.querySelector('.queue-slot.current');
            if (firstEnemySlot) {
                firstEnemySlot.classList.add('lose');
            }
        } else if (result === 'lose') {
            // 我方第一个元素消失
            const firstPlayerSlot = playerQueueContainer.querySelector('.queue-slot.current');
            if (firstPlayerSlot) {
                firstPlayerSlot.classList.add('lose');
            }
        } else {
            // 双方第一个元素都消失
            const firstPlayerSlot = playerQueueContainer.querySelector('.queue-slot.current');
            const firstEnemySlot = enemyQueueContainer.querySelector('.queue-slot.current');
            if (firstPlayerSlot) firstPlayerSlot.classList.add('draw');
            if (firstEnemySlot) firstEnemySlot.classList.add('draw');
        }
    }, 2000);

    // 自动关闭动画
    setTimeout(() => {
        hideAnimation();
        continueProcessing();
    }, 3000);
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
