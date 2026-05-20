# 家账 (HomeLedger)

一个全离线的家庭记账应用，支持双维度（个人/家庭）记账、账本导出/导入/合并。

 ====半成品 待完善====

## 技术栈

- **框架**: UniApp (Vue 3 + Composition API + TypeScript)
- **状态管理**: Pinia
- **存储**: uni.setStorageSync（全离线，无需后端）
- **图表**: Canvas 自绘
- **目标平台**: Android APK + 微信小程序

## 功能特性

### 核心记账
- 双维度记账：个人支出 / 家庭支出自由切换
- 14 种预设分类（餐饮、交通、购物、居住、育儿、教育、医疗、娱乐、服饰、通讯、水电、礼金、维修、其他）
- 支持微信支付、支付宝、现金、银行卡四种支付方式
- 按日期分组展示账单列表

### 统计报表
- 时间维度切换：按日 / 按周 / 按月 / 按年
- 分类排行：每个分类的金额占比
- 支出趋势：Canvas 折线图
- 成员贡献排行（家庭模式下）

### 账本管理
- **完整备份**：导出所有数据，换设备可完全恢复
- **分享账本**：导出记录供家人导入合并
- **智能合并**：按日期+金额+分类自动去重
- **完全追加**：不检查重复，直接合并

### 支付自动记账（Android）
- 监听微信支付、支付宝、银行短信的支付通知
- 根据商户名智能匹配消费分类
- 待确认机制：自动识别的交易进入待确认列表

### 家庭成员管理
- 添加/删除家庭成员
- 导入他人账本时指定归属成员
- 家庭模式下按成员筛选查看

## 项目结构

```
family-ledger/
├── pages.json              # 页面路由 + tabBar 配置
├── manifest.json           # 应用配置
├── App.vue                 # 应用入口
├── main.ts                 # 主入口（Pinia 初始化）
├── uni.scss                # 全局样式变量
├── env.d.ts                # TypeScript 类型声明
│
├── types/                  # 全局类型定义
│   ├── index.ts            # 统一导出
│   ├── record.ts           # 账单记录类型
│   ├── category.ts         # 分类类型
│   ├── member.ts           # 成员类型
│   └── ledger.ts           # 账本元数据 / 导入导出类型
│
├── store/                  # Pinia 状态管理
│   ├── index.ts            # 统一导出
│   ├── record.ts           # 账单 store
│   ├── category.ts         # 分类 store
│   ├── member.ts           # 成员 store
│   └── ledger.ts           # 账本 + 设置 store
│
├── utils/                  # 工具函数
│   ├── storage.ts          # 本地存储封装
│   ├── uuid.ts             # UUID 生成
│   ├── date.ts             # 日期工具
│   ├── platform.ts         # 平台差异处理
│   ├── export.ts           # 导出 .hlk 文件
│   ├── import.ts           # 导入解析与恢复
│   ├── merge.ts            # 合并策略（智能去重 / 完全追加）
│   └── payment-listener.ts # 支付通知监听 + 商户分类匹配
│
├── components/             # 公共组件
│   ├── DimensionToggle.vue # 个人/家庭维度切换
│   ├── CategoryGrid.vue    # 分类选择网格
│   ├── NumberKeypad.vue    # 自定义数字键盘
│   ├── ExpenseCard.vue     # 账单卡片
│   ├── TrendChart.vue      # 趋势折线图（Canvas）
│   ├── CategoryRank.vue    # 分类排行条
│   ├── MonthPicker.vue     # 月份选择器
│   └── MergeDialog.vue     # 合并策略弹窗
│
└── pages/                  # 页面
    ├── home/index.vue      # 首页 — 月度概览 + 账单列表
    ├── add/index.vue       # 记账页 — 金额 + 分类 + 数字键盘
    ├── statistics/index.vue# 统计页 — 趋势图 + 分类排行 + 成员贡献
    ├── ledger/index.vue    # 账本管理 — 导出/导入入口
    ├── ledger/merge.vue    # 合并详情 — 策略选择 + 预览统计
    ├── ledger/import-assign.vue # 导入指定成员
    ├── pending/index.vue   # 待确认账单 — 自动检测交易
    └── profile/index.vue   # 我的 — 成员管理 + 设置
```

## 快速开始

1. 使用 HBuilderX 打开 `family-ledger` 目录
2. 运行到浏览器 / 微信小程序开发者工具 / Android 真机
3. 如需 Android 自动记账功能，需额外编译 `nativeplugins/payment-listener` 原生插件

## 数据格式

### 导出格式 (.hlk)

- **完整备份** (`type: full_backup`)：包含全部数据（记录 + 分类 + 成员 + 设置 + 校验和），用于换设备恢复
- **分享账本** (`type: share`)：只含记录 + 分类 + 成员，用于家人之间导入合并

### 存储限制

- 微信小程序：单 key 1MB，总存储 10MB
- 超限时会提示用户导出清理

## 设计规范

| 变量 | 值 | 用途 |
|------|------|------|
| `$primary` | #6366F1 | 主色（紫色） |
| `$family-color` | #10B981 | 家庭色（绿色） |
| `$expense-red` | #EF4444 | 支出色（红色） |
| `$bg` | #F5F5FA | 页面背景 |
| `$card-bg` | #FFFFFF | 卡片背景 |
| `$card-radius` | 28rpx | 卡片圆角 |
