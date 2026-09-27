# ポコ・ア・ポコ スペイン語（Poco a Poco）

スペイン語を、少しずつ。
無料・広告なし・ログイン不要・オフラインで使える、シンプルなスペイン語学習アプリ（PWA）です。
日本語で学ぶ、スペイン（カスティーリャ）のスペイン語。旅行ですぐ使えるフレーズが中心です。

## できること

- **コース**：10ユニット（あいさつ、自己紹介、数字、カフェ・バル、レストラン、道を尋ねる、買い物、ホテル、交通、困った時）、各ユニット3レッスン、全136語・フレーズ
- **レッスン**：単語カード（スペイン語・意味・カタカナの発音ヒント・例文・🔊）→ ミックスクイズ（意味を選ぶ／スペイン語を選ぶ／聞き取り／タイルで文を作る）
- **復習**：ライトナー方式の間隔反復（1日→2日→4日→8日→16日）。ホームの「復習する (N)」から
- **発音**：端末に入っている読み上げ音声（es-ES 優先）を使用。ネット上の音声サービスは使いません
- **フレーズ帳**：全フレーズを検索、タップで再生
- **記録**：終えたレッスン数・覚えた単語数。連続記録・通知・ランキング・ハートなどはありません
- **表示言語**：日本語 / English（English では英語の意味も表示）
- **設定**：読み上げ速度、進み具合のリセット

記録はすべて端末の localStorage に保存され、外部には送信されません。

### スペイン語の音声がないとき

- iPhone：設定 → アクセシビリティ → 読み上げコンテンツ → 声 → スペイン語 → スペインの声をダウンロード
- Android：設定 → システム → 言語 → テキスト読み上げの出力 → エンジンの設定 → 音声データのインストール → スペイン語（スペイン）

（メニュー名は機種・OSのバージョンによって少し違います）

## 開発

```bash
npm install
npm run dev      # 開発サーバー
npm run build    # dist/ に出力
npm run preview  # ビルドの確認
```

Vite + TypeScript（フレームワークなし）+ vite-plugin-pwa。`main` ブランチに push すると GitHub Actions（`.github/workflows/pages.yml`）で GitHub Pages に公開されます。

---

## English

**Poco a Poco** — Spanish, little by little. A free, ad-free, login-free, offline-first PWA for Japanese speakers learning Castilian Spanish for travel. 10 units / 30 short lessons / 136 items, mixed quizzes, Leitner spaced-repetition review, a searchable phrasebook, and on-device speech (Web Speech API, es-ES preferred). UI in Japanese or English. Progress stays in localStorage.

`npm install && npm run build` → static site in `dist/`. Deployed to GitHub Pages by `.github/workflows/pages.yml`.
