# 🌿 菜园日记

后院菜地管理 App — React + TypeScript + Vite + Firebase

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **数据库**: Firebase Firestore（实时同步，多设备共享）
- **部署**: Vercel（自动从 GitHub 部署）

---

## 部署步骤

### 第一步：Firebase 配置

1. 打开 [Firebase Console](https://console.firebase.google.com/)
2. 点击「Add project」→ 输入项目名（如 `garden-diary`）
3. 项目创建后，点击「**</>**（Web）」图标注册 Web App
4. 复制显示的 `firebaseConfig` 对象里的各项值（后面要用）

5. 在左侧菜单找到 **Firestore Database** → 点「Create database」
   - 选择 **Start in test mode**（测试模式，方便开发）
   - 选择离你最近的服务器地区（如 `asia-east2` 香港）
   - 点「Enable」

### 第二步：上传到 GitHub

1. 在 GitHub 创建新仓库（如 `garden-diary`），**不要**勾选 Initialize README
2. 在本地项目目录执行：

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/你的用户名/garden-diary.git
git push -u origin main
```

### 第三步：Vercel 部署

1. 打开 [Vercel](https://vercel.com/) → 点「Add New Project」
2. 选择刚才的 GitHub 仓库，点「Import」
3. **Framework Preset** 选 `Vite`（应该会自动识别）
4. 展开「**Environment Variables**」，依次添加以下变量：

| Name | Value |
|------|-------|
| `VITE_FIREBASE_API_KEY` | Firebase 控制台里的 apiKey |
| `VITE_FIREBASE_AUTH_DOMAIN` | authDomain |
| `VITE_FIREBASE_PROJECT_ID` | projectId |
| `VITE_FIREBASE_STORAGE_BUCKET` | storageBucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | messagingSenderId |
| `VITE_FIREBASE_APP_ID` | appId |

5. 点「**Deploy**」— 等待约 1 分钟
6. 部署完成后，Vercel 会给你一个 `xxx.vercel.app` 的地址，手机直接访问即可 ✅

### 第四步（可选）：添加到手机主屏幕

**iPhone**: Safari 打开网址 → 点底部分享按钮 → 「添加到主屏幕」

**Android**: Chrome 打开网址 → 点右上角菜单 → 「添加到主屏幕」

---

## 本地开发

```bash
# 安装依赖
npm install

# 复制环境变量
cp .env.example .env.local
# 然后编辑 .env.local，填入你的 Firebase 配置

# 启动开发服务器
npm run dev
```

---

## 项目结构

```
src/
├── types/          # TypeScript 类型定义
├── services/       # Firebase 数据操作
├── styles/         # CSS tokens & global styles
├── components/     # 通用组件 (Header, BottomNav, Sheet...)
├── views/          # 页面视图 (Map, Harvest, Spend, Stats)
├── App.tsx         # 根组件，数据订阅
└── main.tsx        # 入口文件
```

## 功能

- 🗺️ **地图** — 多块菜地管理，上传平面图，Canvas 标注蔬菜位置
- 🧺 **采摘** — 记录每次采摘，筛选统计
- 📒 **支出** — 记录菜园投入，分类账本
- 📊 **统计** — 采摘排行、支出分类、月度对照表
- ☁️ **云同步** — Firebase 实时同步，多设备共享数据
