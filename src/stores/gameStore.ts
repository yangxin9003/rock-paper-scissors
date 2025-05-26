import { defineStore } from 'pinia';
import { HandType, GameState, BattleResult } from '../types';

// 初始配置
const INITIAL_SLOTS = 4;
const INITIAL_HP = 4;

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    playerSlots: [],
    enemySlots: [],
    maxSwaps: 1,
    swapsLeft: 0,
    battleStarted: false,
    selectedSlots: [],
    animationInProgress: false,
    battleLog: [],
    // 新增状态
    level: 1,
    playerHP: INITIAL_HP,
    enemyHP: INITIAL_HP,
    maxPlayerHP: INITIAL_HP,
    maxEnemyHP: INITIAL_HP,
    gameOver: false,
    canContinue: false
  }),

  actions: {
    // 重置游戏状态到第一关
    resetGame() {
      this.playerSlots = [];
      this.enemySlots = [];
      this.swapsLeft = this.maxSwaps;
      this.battleStarted = false;
      this.selectedSlots = [];
      this.animationInProgress = false;
      this.battleLog = [];
      // 重置关卡相关状态
      this.level = 1;
      this.playerHP = INITIAL_HP;
      this.enemyHP = INITIAL_HP;
      this.maxPlayerHP = INITIAL_HP;
      this.maxEnemyHP = INITIAL_HP;
      this.gameOver = false;
      this.canContinue = false;

      // 生成初始手势
      this.generateRandomSlots();
    },

    // 进入下一关
    nextLevel() {
      this.level++;
      this.battleLog = [];

      // 敌人血量和槽位数量+1
      this.maxEnemyHP = INITIAL_HP + (this.level - 1);
      this.enemyHP = this.maxEnemyHP;

      // 恢复玩家血量
      this.playerHP = this.maxPlayerHP;

      // 重置战斗状态
      this.battleStarted = false;
      this.swapsLeft = this.maxSwaps;
      this.canContinue = false;

      // 生成新的手势
      this.generateRandomSlots();

      // 记录关卡变化
      this.addToBattleLog(`进入第 ${this.level} 关！敌人血量增加到 ${this.enemyHP}`, 'level');
    },

    // 继续游戏，为下一轮战斗准备
    continueGame() {
      this.battleStarted = false;
      this.swapsLeft = this.maxSwaps;
      this.canContinue = false;

      // 生成新的手势
      this.generateRandomSlots();

      // 添加日志
      this.addToBattleLog(`准备下一轮战斗！`, 'info');
    },

    // 随机生成手势
    getRandomHand(): HandType {
      const hands = [HandType.Rock, HandType.Scissors, HandType.Paper];
      const randomIndex = Math.floor(Math.random() * hands.length);
      return hands[randomIndex];
    },

    // 随机生成槽位
    generateRandomSlots() {
      // 玩家始终有4个槽位
      this.playerSlots = Array(INITIAL_SLOTS).fill(null).map(() => this.getRandomHand());

      // 敌人槽位数量随关卡增加
      const enemySlots = INITIAL_SLOTS + (this.level - 1);
      this.enemySlots = Array(enemySlots).fill(null).map(() => this.getRandomHand());

      this.swapsLeft = this.maxSwaps;
    },

    // 选择要交换的槽位
    selectSlotForSwap(index: number) {
      const slotIndex = this.selectedSlots.indexOf(index);

      if (slotIndex === -1) {
        // 如果尚未选中，则添加到选中列表
        if (this.selectedSlots.length < 2) {
          this.selectedSlots.push(index);
        }
      } else {
        // 如果已选中，则从选中列表中移除
        this.selectedSlots.splice(slotIndex, 1);
      }
    },

    // 交换槽位
    swapSlots() {
      if (this.selectedSlots.length !== 2 || this.swapsLeft <= 0) {
        return;
      }

      const [indexA, indexB] = this.selectedSlots;
      // 交换位置
      [this.playerSlots[indexA], this.playerSlots[indexB]] =
        [this.playerSlots[indexB], this.playerSlots[indexA]];

      // 减少剩余交换次数
      this.swapsLeft--;

      // 清空选中状态
      this.selectedSlots = [];
    },

    // 添加到战斗日志
    addToBattleLog(message: string, className: string = '') {
      this.battleLog.push({ message, className });
    },

    // 判断胜负
    determineWinner(playerHand: HandType, enemyHand: HandType): string {
      if (playerHand === enemyHand) {
        return 'draw';
      }

      if (
        (playerHand === HandType.Rock && enemyHand === HandType.Scissors) ||
        (playerHand === HandType.Scissors && enemyHand === HandType.Paper) ||
        (playerHand === HandType.Paper && enemyHand === HandType.Rock)
      ) {
        return 'player';
      }

      return 'enemy';
    },

    // 开始战斗
    startBattle(): BattleResult {
      this.battleStarted = true;
      this.battleLog = [];
      this.addToBattleLog(`第 ${this.level} 关 - 开始战斗！`, 'level');
      this.addToBattleLog(`你的HP: ${this.playerHP}/${this.maxPlayerHP} | 敌人HP: ${this.enemyHP}/${this.maxEnemyHP}`, 'hp');

      let playerWins = 0;
      let enemyWins = 0;
      let draws = 0;
      let round = 1;

      // 拷贝初始手势状态用于显示每轮对战情况
      let playerHandsCopy = [...this.playerSlots];
      let enemyHandsCopy = [...this.enemySlots];

      // 战斗循环，直到一方没有手势
      while (playerHandsCopy.length > 0 && enemyHandsCopy.length > 0) {
        // 获取双方的当前手势（始终是第一个）
        const playerHand = playerHandsCopy[0];
        const enemyHand = enemyHandsCopy[0];

        // 记录战斗日志 - 本轮对战情况
        this.addToBattleLog(`第${round}轮: 你出了 ${playerHand} vs 敌人的 ${enemyHand}`);

        // 判断胜负
        const result = this.determineWinner(playerHand, enemyHand);

        // 根据胜负更新手势数组和日志
        if (result === 'player') {
          // 玩家胜：玩家保留手势，敌人失去手势
          enemyHandsCopy.shift();
          playerWins++;
          this.addToBattleLog(`结果: 你赢了！你保留手势，敌人失去手势`, 'win');
        } else if (result === 'enemy') {
          // 敌人胜：敌人保留手势，玩家失去手势
          playerHandsCopy.shift();
          enemyWins++;
          this.addToBattleLog(`结果: 敌人赢了！敌人保留手势，你失去手势`, 'lose');
        } else {
          // 平局：双方都失去手势
          playerHandsCopy.shift();
          enemyHandsCopy.shift();
          draws++;
          this.addToBattleLog(`结果: 平局！双方都失去手势`, 'draw');
        }

        // 记录本轮后的手势状态
        this.addToBattleLog(`你方剩余: ${playerHandsCopy.join(' ')}`, 'info');
        this.addToBattleLog(`敌方剩余: ${enemyHandsCopy.join(' ')}`, 'info');
        this.addToBattleLog(`------------------------`, 'separator');

        round++;
      }

      // 计算双方对对方造成的伤害
      const playerDamage = playerHandsCopy.length;
      const enemyDamage = enemyHandsCopy.length;

      // 更新双方血量
      this.playerHP = Math.max(0, this.playerHP - enemyDamage);
      this.enemyHP = Math.max(0, this.enemyHP - playerDamage);

      // 记录伤害情况
      this.addToBattleLog(`你对敌人造成 ${playerDamage} 点伤害！`, playerDamage > 0 ? 'win' : 'info');
      this.addToBattleLog(`敌人对你造成 ${enemyDamage} 点伤害！`, enemyDamage > 0 ? 'lose' : 'info');
      this.addToBattleLog(`你的HP: ${this.playerHP}/${this.maxPlayerHP} | 敌人HP: ${this.enemyHP}/${this.maxEnemyHP}`, 'hp');

      // 确定整体胜负
      let winner: 'player' | 'enemy' | 'draw';
      let gameOver = false;
      let nextLevel = false;
      let canContinue = false;

      if (playerHandsCopy.length > enemyHandsCopy.length) {
        winner = 'player';
      } else if (enemyHandsCopy.length > playerHandsCopy.length) {
        winner = 'enemy';
      } else {
        winner = 'draw';
      }

      // 检查是否有一方血量为0
      if (this.playerHP <= 0) {
        this.addToBattleLog(`你的生命值降为0，游戏结束！`, 'lose');
        gameOver = true;
      } else if (this.enemyHP <= 0) {
        this.addToBattleLog(`敌人的生命值降为0，你赢了！准备进入下一关！`, 'win');
        nextLevel = true;
      } else {
        this.addToBattleLog(`双方都还有生命值，本轮对战结束！准备下一轮战斗`, 'info');
        canContinue = true;
      }

      // 更新游戏状态
      this.playerSlots = playerHandsCopy;
      this.enemySlots = enemyHandsCopy;
      this.gameOver = gameOver;
      this.canContinue = canContinue;

      return {
        playerWins,
        enemyWins,
        draws,
        winner,
        playerHP: this.playerHP,
        enemyHP: this.enemyHP,
        level: this.level,
        gameOver,
        nextLevel,
        canContinue
      };
    },

    // 设置动画进行中状态
    setAnimationInProgress(value: boolean) {
      this.animationInProgress = value;
    }
  }
});
