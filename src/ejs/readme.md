## 各ファイル説明

menu.ejsとかあげる  
トップ以外もあげる  

ファイル内は、svg 絶対インライン化する？？


```
├── inc：その他
│   ├── _log.ejs：gaなど
│   ├── _meta.ejs：メタ情報など
│   ├── _script.ejs：jsなど
│   └── metaData.json：メタ情報のデータ
│
├── page：各ページhtml
│   ├── index.ejs：トップページ
│   └── top：トップページの中で使うhtml
│       └── _section01.ejs
│
└── parts：共通で使うhtml
    └── common：共通の中でもheader,footerなど
        ├── _footer.ejs
        └── _header.ejs
```
