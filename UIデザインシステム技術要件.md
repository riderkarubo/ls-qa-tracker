# UIデザインシステム技術要件

## 概要

このドキュメントは、カラフルで見やすいUIを実現するための技術要件とデザインガイドラインを定義します。`各ツール.html`で実装されているUIパターンを分析し、再現性の高い実装方法を言語化したものです。

## 1. デザイン原則

### 1.1 基本方針

- **視認性の確保**: 情報の階層を明確にし、重要な要素を視覚的に強調する
- **一貫性の維持**: カラーパレット、スペーシング、タイポグラフィを統一する
- **インタラクティブ性**: ユーザーの操作に対して明確な視覚的フィードバックを提供する
- **レスポンシブ対応**: モバイルからデスクトップまで適切に表示される

### 1.2 見た目の要因

1. **カラフルな配色**: カテゴリごとに色を割り当て、視覚的な区別を明確にする
2. **適切な余白**: 要素間のスペーシングを統一し、読みやすさを確保する
3. **階層的な情報構造**: タイトル、説明、詳細情報を明確に分離する
4. **視覚的なアイコン**: 絵文字やアイコンで情報を補完し、直感的な理解を促進する
5. **微細なアニメーション**: フェードインやホバーエフェクトで動きを加える

## 2. カラーパレットシステム

### 2.1 カテゴリ別カラー定義

各カテゴリ/ツールには一貫したカラーパレットを割り当てます。

#### カラー階層の構造

各カテゴリには以下の4段階の色を使用します：

```typescript
interface CategoryColor {
  // 背景色（薄い色、-100）
  background: string;  // 例: 'bg-blue-100'
  
  // テキスト色（濃い色、-800）
  text: string;        // 例: 'text-blue-800'
  
  // ボーダー色（中間色、-200）
  border: string;      // 例: 'border-blue-200'
  
  // アイコン色（中間色、-600）
  icon: string;        // 例: 'text-blue-600'
}
```

#### 推奨カラーパレット

| カテゴリ | 背景色 | テキスト色 | ボーダー色 | アイコン色 | 使用例 |
|---------|--------|-----------|-----------|-----------|--------|
| プライマリ | `bg-blue-100` | `text-blue-800` | `border-blue-200` | `text-blue-600` | 主要機能、アクション |
| セカンダリ | `bg-green-100` | `text-green-800` | `border-green-200` | `text-green-600` | 分析、データ |
| アクセント | `bg-indigo-100` | `text-indigo-800` | `border-indigo-200` | `text-indigo-600` | 特殊機能、開発 |
| 警告 | `bg-yellow-100` | `text-yellow-800` | `border-yellow-200` | `text-yellow-600` | 注意事項 |
| 成功 | `bg-green-50` | `text-green-700` | `border-green-200` | `text-green-600` | 強調表示 |

### 2.2 ベースカラー

- **背景**: `bg-gray-50` (ページ全体)
- **カード背景**: `bg-white`
- **テキスト**: `text-gray-800` (本文), `text-gray-600` (補足), `text-gray-400` (無効)
- **ボーダー**: `border-gray-200` (標準), `border-gray-100` (薄い)

### 2.3 実装例

```tsx
// カテゴリカラーの定義
const categoryColors = {
  primary: {
    background: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: 'text-blue-600',
  },
  secondary: {
    background: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: 'text-green-600',
  },
  accent: {
    background: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    icon: 'text-indigo-600',
  },
};

// 使用例
<div className={`rounded-xl border-2 ${categoryColors.primary.border} p-6 bg-white`}>
  <div className={`w-16 h-16 rounded-full ${categoryColors.primary.background} flex items-center justify-center`}>
    <span className={`text-3xl ${categoryColors.primary.icon}`}>🤖</span>
  </div>
  <h3 className={`text-xl font-bold ${categoryColors.primary.text}`}>タイトル</h3>
</div>
```

## 3. コンポーネントパターン

### 3.1 カードコンポーネント

#### 基本構造

```tsx
<div className="rounded-xl border-2 border-{color}-200 p-6 flex flex-col h-full bg-white shadow-sm hover:shadow-md transition-shadow">
  {/* コンテンツ */}
</div>
```

#### 必須クラス

- `rounded-xl`: 角丸（16px相当）
- `border-2`: 2pxのボーダー
- `p-6`: パディング24px
- `bg-white`: 白背景
- `shadow-sm`: 軽い影
- `hover:shadow-md`: ホバー時に影を強調
- `transition-shadow`: 影の変化をスムーズに

#### カード内要素の配置

```tsx
// アイコン（円形）
<div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-{color}-100">
  <span className="text-3xl">🎯</span>
</div>

// タイトル
<h3 className="text-xl font-bold mb-2">タイトル</h3>

// バッジ/タグ
<div className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 w-fit bg-{color}-100 text-{color}-800">
  ラベル
</div>

// 説明文
<p className="text-gray-600 mb-6 flex-grow">説明テキスト</p>

// 詳細情報（ラベル: 値の形式）
<div className="space-y-3 text-sm">
  <div className="flex items-start">
    <span className="font-bold mr-2 w-16 text-gray-700">ラベル:</span>
    <span className="text-gray-600">値</span>
  </div>
</div>
```

### 3.2 タブナビゲーション

#### 基本構造

```tsx
<div className="flex flex-wrap justify-center gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm border border-gray-200 w-fit mx-auto">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all
        ${activeTab === tab.id
          ? 'bg-gray-900 text-white shadow-md'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
    >
      <span>{tab.iconText}</span>
      {tab.label}
    </button>
  ))}
</div>
```

#### 状態管理

- **アクティブ**: `bg-gray-900 text-white shadow-md`
- **非アクティブ**: `text-gray-500 hover:bg-gray-100 hover:text-gray-900`
- **トランジション**: `transition-all`

### 3.3 ボタンコンポーネント

#### インタラクティブボタン

```tsx
<button
  onClick={handleClick}
  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3
    ${isSelected
      ? 'border-gray-800 bg-gray-800 text-white shadow-lg'
      : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50'}`}
>
  <div className={`p-2 rounded-full ${isSelected ? 'bg-gray-700' : 'bg-gray-100'}`}>
    <span>🎯</span>
  </div>
  <span className="font-medium">ボタンテキスト</span>
</button>
```

#### アクションバッジ

```tsx
<div className={`px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider
  bg-{color}-100 text-{color}-700`}>
  アクション名
</div>
```

### 3.4 テーブルコンポーネント

#### 基本構造

```tsx
<div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-200">
          <th className="p-4 font-bold text-gray-700">列名</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        <tr>
          <td className="p-4 font-semibold text-gray-700 bg-gray-50/50">ラベル</td>
          <td className="p-4 text-sm">値</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

#### 強調表示

重要なセルには背景色とテキスト色を適用：

```tsx
<td className="p-4 text-sm font-bold text-green-700 bg-green-50">
  強調テキスト
</td>
```

## 4. レイアウトガイドライン

### 4.1 コンテナ構造

```tsx
<div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
  <div className="max-w-6xl mx-auto">
    {/* コンテンツ */}
  </div>
</div>
```

- **外側コンテナ**: `min-h-screen bg-gray-50 p-4 md:p-8`
- **内側コンテナ**: `max-w-6xl mx-auto` (最大幅1152px、中央揃え)

### 4.2 グリッドレイアウト

#### レスポンシブグリッド

```tsx
// 1列（モバイル）→ 3列（タブレット以上）
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* カード要素 */}
</div>

// 1列（モバイル）→ 2列（大画面）
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* コンテンツ */}
</div>
```

#### ギャップサイズ

- **小**: `gap-2` (8px) - タブ間など
- **中**: `gap-6` (24px) - カード間
- **大**: `gap-8` (32px) - セクション間

### 4.3 スペーシングシステム

#### マージン/パディングの階層

| 用途 | クラス | サイズ | 使用例 |
|------|--------|--------|--------|
| コンパクト | `p-2`, `m-2` | 8px | タブコンテナ |
| 標準 | `p-4`, `m-4` | 16px | ボタン、セル |
| 中 | `p-6`, `m-6` | 24px | カード内パディング |
| 大 | `p-8`, `m-8` | 32px | セクション間 |
| 特大 | `mb-10`, `mt-16` | 40px, 64px | ヘッダー下、フッター上 |

#### 垂直スペーシング

```tsx
// 要素間の垂直スペーシング
<div className="space-y-3">  {/* 12px間隔 */}
<div className="space-y-4">  {/* 16px間隔 */}
<div className="space-y-8">  {/* 32px間隔 */}
```

### 4.4 フレックスレイアウト

```tsx
// 水平配置（中央揃え）
<div className="flex items-center justify-center gap-2">

// 垂直配置
<div className="flex flex-col items-center gap-4">

// レスポンシブ（縦→横）
<div className="flex flex-col md:flex-row gap-6 items-start">
```

## 5. インタラクション設計

### 5.1 ホバーエフェクト

#### カードのホバー

```tsx
<div className="shadow-sm hover:shadow-md transition-shadow">
```

#### ボタンのホバー

```tsx
<button className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all">
```

#### ボーダーのホバー

```tsx
<div className="border-gray-200 hover:border-gray-400 transition-all">
```

### 5.2 トランジション

#### 推奨設定

- **標準**: `transition-all duration-200`
- **スムーズ**: `transition-all duration-300 ease-in-out`
- **影のみ**: `transition-shadow`

### 5.3 アニメーション

#### フェードインアニメーション

```css
@keyframes fade-in {
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

.animate-fade-in { 
  animation: fade-in 0.3s ease-out; 
}
```

#### 使用例

```tsx
<div className="animate-fade-in">
  {/* 動的に表示されるコンテンツ */}
</div>
```

## 6. タイポグラフィシステム

### 6.1 フォントサイズ階層

| 用途 | クラス | サイズ | 使用例 |
|------|--------|--------|--------|
| ページタイトル | `text-3xl md:text-4xl` | 30px/36px | メインタイトル |
| セクションタイトル | `text-2xl` | 24px | セクション見出し |
| カードタイトル | `text-xl` | 20px | カード内タイトル |
| サブタイトル | `text-lg` | 18px | 説明文の見出し |
| 本文 | `text-base` (デフォルト) | 16px | 通常のテキスト |
| 補足情報 | `text-sm` | 14px | 詳細情報、ラベル |
| 小さなテキスト | `text-xs` | 12px | バッジ、タグ |

### 6.2 フォントウェイト

- `font-extrabold` (800): ページタイトル
- `font-bold` (700): セクションタイトル、カードタイトル
- `font-semibold` (600): ラベル、バッジ
- `font-medium` (500): ボタンテキスト
- `font-normal` (400): 本文（デフォルト）

### 6.3 行間

- `leading-none`: アイコン、バッジ
- `leading-relaxed`: 本文、説明文
- デフォルト: 通常の行間

### 6.4 実装例

```tsx
// ページタイトル
<h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
  タイトル
</h1>

// 説明文
<p className="text-lg text-gray-600 max-w-2xl mx-auto">
  説明テキスト
</p>

// カードタイトル
<h3 className="text-xl font-bold mb-2">カードタイトル</h3>

// 本文
<p className="text-gray-600 leading-relaxed">本文テキスト</p>
```

## 7. アイコンと視覚要素

### 7.1 アイコンの使用

#### 絵文字アイコン

```tsx
// 円形アイコンコンテナ
<div className="w-16 h-16 rounded-full bg-{color}-100 flex items-center justify-center">
  <span className="text-3xl leading-none" aria-hidden="true">🤖</span>
</div>

// インラインアイコン
<span className="mr-2" aria-hidden="true">✅</span>
```

#### サイズバリエーション

- **小**: `text-xl` (20px) - インライン
- **中**: `text-3xl` (30px) - カード内アイコン
- **大**: `text-5xl` (48px) - 強調表示

### 7.2 角丸の階層

- `rounded-full`: 完全な円（アイコン、バッジ）
- `rounded-xl`: 大きな角丸（16px、カード）
- `rounded-lg`: 中程度の角丸（8px、ボタン、小さなカード）

### 7.3 影の階層

- `shadow-sm`: 軽い影（カードの標準状態）
- `shadow-md`: 中程度の影（ホバー時、アクティブタブ）
- `shadow-lg`: 強い影（選択された要素）

## 8. 実装チェックリスト

### 8.1 カラーパレット

- [ ] 各カテゴリに一貫したカラーパレットを適用している
- [ ] 背景色（-100）、テキスト色（-800）、ボーダー色（-200）、アイコン色（-600）を正しく使用している
- [ ] コントラスト比が十分で、視認性が確保されている

### 8.2 レイアウト

- [ ] レスポンシブグリッド（`grid-cols-1 md:grid-cols-3`など）を使用している
- [ ] コンテナに`max-w-6xl mx-auto`を適用している
- [ ] 適切なギャップ（`gap-6`, `gap-8`）を設定している

### 8.3 コンポーネント

- [ ] カードに`rounded-xl border-2 shadow-sm hover:shadow-md`を適用している
- [ ] タブナビゲーションにアクティブ/非アクティブ状態を実装している
- [ ] ボタンにホバーエフェクトとトランジションを追加している

### 8.4 タイポグラフィ

- [ ] フォントサイズの階層（`text-3xl`, `text-xl`, `text-lg`など）を適切に使用している
- [ ] フォントウェイト（`font-bold`, `font-semibold`など）で情報の重要度を表現している
- [ ] 行間（`leading-relaxed`）を本文に適用している

### 8.5 インタラクション

- [ ] ホバーエフェクト（`hover:shadow-md`, `hover:bg-gray-100`など）を実装している
- [ ] トランジション（`transition-all duration-200`など）を追加している
- [ ] アニメーション（フェードインなど）を適切に使用している

### 8.6 スペーシング

- [ ] マージン/パディングの階層（`p-4`, `p-6`, `p-8`など）を統一している
- [ ] 垂直スペーシング（`space-y-3`, `space-y-4`など）を適切に使用している
- [ ] 要素間の余白が視覚的にバランスが取れている

### 8.7 アクセシビリティ

- [ ] アイコンに`aria-hidden="true"`を設定している
- [ ] コントラスト比がWCAG基準を満たしている
- [ ] キーボード操作が可能になっている

## 9. コード例

### 9.1 完全なカードコンポーネント例

```tsx
interface CardProps {
  category: 'primary' | 'secondary' | 'accent';
  icon: string;
  title: string;
  label: string;
  description: string;
  details: Array<{ label: string; value: string }>;
}

const CategoryCard: React.FC<CardProps> = ({ 
  category, 
  icon, 
  title, 
  label, 
  description, 
  details 
}) => {
  const colors = {
    primary: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: 'text-blue-600',
    },
    secondary: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      icon: 'text-green-600',
    },
    accent: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
      icon: 'text-indigo-600',
    },
  };

  const color = colors[category];

  return (
    <div className={`rounded-xl border-2 ${color.border} p-6 flex flex-col h-full bg-white shadow-sm hover:shadow-md transition-shadow`}>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${color.bg}`}>
        <span className="text-3xl leading-none" aria-hidden="true">{icon}</span>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 w-fit ${color.bg} ${color.text}`}>
        {label}
      </div>
      <p className="text-gray-600 mb-6 flex-grow">{description}</p>
      <div className="space-y-3 text-sm">
        {details.map((detail, index) => (
          <div key={index} className="flex items-start">
            <span className="font-bold mr-2 w-16 text-gray-700">{detail.label}:</span>
            <span className="text-gray-600">{detail.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 9.2 タブナビゲーション例

```tsx
interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange 
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm border border-gray-200 w-fit mx-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all
            ${activeTab === tab.id
              ? 'bg-gray-900 text-white shadow-md'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
        >
          <span aria-hidden="true">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
};
```

### 9.3 ページレイアウト例

```tsx
interface PageLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  title, 
  description, 
  children 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            {title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {description}
          </p>
        </header>
        <div className="transition-all duration-300 ease-in-out">
          {children}
        </div>
        <footer className="mt-16 text-center text-gray-400 text-sm">
          <p>© 2026 Your App Name</p>
        </footer>
      </div>
    </div>
  );
};
```

## 10. Tailwind CSS設定

### 10.1 推奨設定

`tailwind.config.js`に以下の設定を追加することを推奨します：

```javascript
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'fade-in': {
          'from': { 
            opacity: '0', 
            transform: 'translateY(10px)' 
          },
          'to': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
      },
    },
  },
};
```

## 11. よくある実装パターン

### 11.1 ワークフロー表示（ステップバイステップ）

```tsx
interface WorkflowStep {
  step: number;
  title: string;
  description: string;
  category?: 'primary' | 'secondary' | 'accent';
  isManual?: boolean;
}

const WorkflowDisplay: React.FC<{ steps: WorkflowStep[] }> = ({ steps }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative">
        {/* 縦線（デスクトップのみ） */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-200 hidden md:block"></div>
        
        <div className="space-y-8">
          {steps.map((item, index) => {
            const colors = item.category 
              ? {
                  primary: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
                  secondary: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
                  accent: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
                }[item.category]
              : { bg: 'bg-gray-200', text: 'text-gray-700', border: 'border-gray-200' };
            
            return (
              <div key={index} className="relative flex flex-col md:flex-row gap-6 items-start">
                {/* ステップ番号 */}
                <div className="md:w-16 md:h-16 w-12 h-12 rounded-full bg-gray-800 text-white flex items-center justify-center text-xl font-bold flex-shrink-0 z-10 border-4 border-white shadow-md">
                  {item.step}
                </div>
                
                {/* コンテンツカード */}
                <div className={`flex-grow rounded-xl p-6 border-2 shadow-sm ${
                  item.isManual 
                    ? 'bg-gray-50 border-gray-200 border-dashed' 
                    : 'bg-white border-gray-100'
                }`}>
                  <h4 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                    {item.title}
                    {item.isManual && (
                      <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        Manual Task
                      </span>
                    )}
                  </h4>
                  <p className="text-gray-700 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
```

### 11.2 診断/選択インターフェース

```tsx
interface DiagnosticOption {
  id: string;
  question: string;
  icon: string;
  recommendation?: {
    tool: string;
    reason: string;
    color: 'primary' | 'secondary' | 'accent';
  };
}

const DiagnosticInterface: React.FC<{ options: DiagnosticOption[] }> = ({ options }) => {
  const [selected, setSelected] = React.useState<string | null>(null);
  const selectedOption = options.find(opt => opt.id === selected);
  
  const colors = {
    primary: { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'text-blue-600' },
    secondary: { bg: 'bg-green-100', text: 'text-green-800', icon: 'text-green-600' },
    accent: { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: 'text-indigo-600' },
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 選択肢リスト */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
          <span className="mr-2" aria-hidden="true">❓</span>
          あなたのやりたいことは？
        </h3>
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelected(option.id)}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3
              ${selected === option.id
                ? 'border-gray-800 bg-gray-800 text-white shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50'}`}
          >
            <div className={`p-2 rounded-full ${
              selected === option.id ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <span aria-hidden="true">{option.icon}</span>
            </div>
            <span className="font-medium">{option.question}</span>
          </button>
        ))}
      </div>
      
      {/* 推奨結果表示 */}
      <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 flex flex-col justify-center items-center text-center min-h-[300px]">
        {selectedOption?.recommendation ? (
          <div className="animate-fade-in w-full">
            <div className="text-sm text-gray-500 mb-2 uppercase tracking-wide font-bold">
              Recommended Tool
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
                colors[selectedOption.recommendation.color].bg
              }`}>
                <span className={`text-5xl leading-none ${
                  colors[selectedOption.recommendation.color].icon
                }`}>🎯</span>
              </div>
              <h2 className={`text-3xl font-bold mb-2 ${
                colors[selectedOption.recommendation.color].icon
              }`}>
                {selectedOption.recommendation.tool}
              </h2>
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm w-full text-left">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                  <span className="mr-2" aria-hidden="true">✅</span>
                  選定理由
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {selectedOption.recommendation.reason}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-400 flex flex-col items-center">
            <div className="mb-4 text-5xl opacity-50" aria-hidden="true">🔎</div>
            <p>左のリストから<br/>やりたいことを選択してください</p>
          </div>
        )}
      </div>
    </div>
  );
};
```

### 11.3 情報ボックス（アラート/ヒント）

```tsx
interface InfoBoxProps {
  type: 'info' | 'success' | 'warning';
  title: string;
  description: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({ type, title, description }) => {
  const styles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      title: 'text-blue-800',
      text: 'text-blue-600',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      title: 'text-green-800',
      text: 'text-green-600',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      title: 'text-yellow-800',
      text: 'text-yellow-600',
    },
  };
  
  const style = styles[type];
  
  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-4 text-center`}>
      <h3 className={`${style.title} font-bold text-lg mb-1`}>{title}</h3>
      <p className={style.text}>{description}</p>
    </div>
  );
};
```

## 12. クイックリファレンス

### 12.1 カラークラス一覧

| カテゴリ | 背景 | テキスト | ボーダー | アイコン |
|---------|------|---------|---------|---------|
| プライマリ | `bg-blue-100` | `text-blue-800` | `border-blue-200` | `text-blue-600` |
| セカンダリ | `bg-green-100` | `text-green-800` | `border-green-200` | `text-green-600` |
| アクセント | `bg-indigo-100` | `text-indigo-800` | `border-indigo-200` | `text-indigo-600` |

### 12.2 よく使うクラス組み合わせ

```tsx
// カード
className="rounded-xl border-2 border-{color}-200 p-6 bg-white shadow-sm hover:shadow-md transition-shadow"

// ボタン（アクティブ）
className="px-6 py-3 rounded-lg font-bold bg-gray-900 text-white shadow-md"

// ボタン（非アクティブ）
className="px-6 py-3 rounded-lg font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all"

// アイコンコンテナ
className="w-16 h-16 rounded-full bg-{color}-100 flex items-center justify-center"

// バッジ
className="px-3 py-1 rounded-full text-sm font-semibold bg-{color}-100 text-{color}-800"

// ページコンテナ
className="min-h-screen bg-gray-50 p-4 md:p-8"
className="max-w-6xl mx-auto"

// グリッド
className="grid grid-cols-1 md:grid-cols-3 gap-6"
```

### 12.3 スペーシング早見表

| 用途 | クラス | サイズ |
|------|--------|--------|
| コンパクト | `p-2`, `gap-2` | 8px |
| 標準 | `p-4`, `gap-4` | 16px |
| 中 | `p-6`, `gap-6` | 24px |
| 大 | `p-8`, `gap-8` | 32px |
| 特大 | `mb-10`, `mt-16` | 40px, 64px |

## 13. トラブルシューティング

### 13.1 よくある問題と解決方法

#### 問題: カードの高さが揃わない

**解決方法**: カードコンテナに`flex flex-col h-full`を追加し、最後の要素に`flex-grow`を適用

```tsx
<div className="flex flex-col h-full">
  {/* コンテンツ */}
  <p className="flex-grow">説明文</p>
</div>
```

#### 問題: ホバーエフェクトが効かない

**解決方法**: `transition-all`または`transition-shadow`を追加

```tsx
<div className="shadow-sm hover:shadow-md transition-shadow">
```

#### 問題: モバイルでレイアウトが崩れる

**解決方法**: レスポンシブクラスを確認（`md:`, `lg:`プレフィックス）

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
```

#### 問題: アニメーションが動作しない

**解決方法**: 
1. Tailwind設定にkeyframesを追加（セクション10参照）
2. または、グローバルCSSに直接定義

```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.3s ease-out; }
```

#### 問題: 色のコントラストが低い

**解決方法**: テキスト色を-800、背景色を-100に統一

```tsx
// ❌ 悪い例
<div className="bg-blue-200 text-blue-300">

// ✅ 良い例
<div className="bg-blue-100 text-blue-800">
```

## 14. 実装ワークフロー

### 14.1 新規プロジェクトでの適用手順

1. **Tailwind CSSのセットアップ**
   ```bash
   npm install -D tailwindcss
   npx tailwindcss init
   ```

2. **カラーパレットの定義**
   - セクション2を参照してカテゴリカラーを定義
   - TypeScriptの型定義を作成（オプション）

3. **基本レイアウトの実装**
   - セクション4を参照してページコンテナを作成
   - セクション9.3のPageLayoutコンポーネントを使用

4. **コンポーネントの実装**
   - セクション3を参照してカード、タブ、ボタンを作成
   - セクション9のコード例を参考に実装

5. **インタラクションの追加**
   - セクション5を参照してホバーエフェクトとアニメーションを追加

6. **チェックリストの確認**
   - セクション8のチェックリストで実装を確認

### 14.2 既存プロジェクトへの適用

1. **既存コンポーネントの分析**
   - 現在のデザインシステムを確認
   - 適用可能なパターンを特定

2. **段階的な移行**
   - 新規コンポーネントから適用
   - 既存コンポーネントは必要に応じて段階的に更新

3. **一貫性の確保**
   - カラーパレットを統一
   - スペーシングとタイポグラフィを標準化

## 15. まとめ

この技術要件書に従うことで、以下の特徴を持つUIを実現できます：

1. **カラフルで視認性の高いデザイン**: カテゴリごとの色分けで情報を整理
2. **一貫性のあるコンポーネント**: 再利用可能なパターンで開発効率を向上
3. **レスポンシブ対応**: モバイルからデスクトップまで適切に表示
4. **インタラクティブな体験**: ホバーエフェクトとアニメーションで操作性を向上
5. **情報の階層化**: タイポグラフィとスペーシングで読みやすさを確保

### 次のステップ

1. このドキュメントをプロジェクトの技術要件として保存
2. 新規プロジェクト開始時にこのドキュメントを参照
3. チームメンバーと共有し、デザインシステムを統一
4. 必要に応じてプロジェクト固有のカスタマイズを追加

このドキュメントを参照することで、新しいWebアプリでも同様のカラフルで見やすいUIを効率的に実装できます。
