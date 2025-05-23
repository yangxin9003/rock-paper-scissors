# 石头剪刀布游戏

一个基于TypeScript和Vite构建的石头剪刀布游戏，支持动画效果和对战记录。

## 游戏规则

1. 双方各有4个手势槽位，可以随机生成石头、剪刀、布
2. 玩家有一次调整手势顺序的机会
3. 开始对战后，双方的手势将从左到右依次对战
4. 根据传统规则判定胜负：石头胜剪刀，剪刀胜布，布胜石头
5. 胜者保留手势，败者失去手势，平局双方都失去手势
6. 继续下一回合，直到一方没有手势剩余
7. 所有手势都消耗完的一方为败方

## 特性

- 精美的动画效果，展示对战过程和手势变化
- 详细的对战记录，记录每个回合的结果
- 响应式设计，适配移动端和桌面端
- 使用TypeScript确保代码质量和类型安全

## 技术栈

- TypeScript：强类型的JavaScript超集
- Vite：现代前端构建工具
- pnpm：快速、节省磁盘空间的包管理器

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 部署

项目使用GitHub Actions自动部署到GitHub Pages。每次推送到main或master分支时，会自动触发构建和部署流程。

您可以在此查看在线演示：[石头剪刀布游戏](https://yangxin9003.github.io/rock-paper-scissors/)

## 自定义

如果您要部署到自己的GitHub Pages：

1. Fork本仓库
2. 在package.json中修改`homepage`字段为您的GitHub Pages地址
3. 在vite.config.ts中修改`base`字段为您的仓库名称
4. 推送您的更改，GitHub Actions将自动部署

