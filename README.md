# Career Canvas

ブラウザで履歴書・職務経歴書を作成し、A4で印刷またはPDF保存できる静的Webアプリです。

## 特長

- 履歴書と職務経歴書の入力フォーム
- 入力と同時に更新されるA4プレビュー
- 印刷ダイアログから印刷／PDF保存
- ブラウザ内への自動保存（入力内容をサーバーに送信しません）
- PC・スマートフォン対応
- 見本データのワンクリック入力

## ローカルで確認

`index.html` をブラウザで開くだけでも使えます。ローカルサーバーを使う場合は、Pythonがある環境で次を実行します。

```powershell
python -m http.server 3000
```

その後 `http://localhost:3000` を開きます。

## Vercelで公開

1. このフォルダをGitHubのリポジトリにpushします。
2. Vercelで「Add New Project」を選び、リポジトリを読み込みます。
3. Framework Presetは「Other」、Build CommandとOutput Directoryは空欄のまま公開します。

静的サイトなので環境変数やデータベースは不要です。入力内容は各利用者のブラウザ内だけに保存されます。
