## 各ファイル説明


meduaquery,mixinじゃないか？  
skin消したい
```
よく使うui.cssを分ける ← persol
   menu
   slider
   lodingなど

  → layout
  → module.cssに
```


```
├── _init：設定・関数定義ファイル郡
│   ├── _config.scss：初期設定
│   ├── _extend.scss：extendを定義するファイル
│   ├── _import.scss：style.scssに設定・関数定義ファイル郡を読み込むためのファイル
│   ├── _mixin.scss：：mixinを定義するファイル
│   ├── _reset.scss：reset定義ファイル(何をベースだったか)
│   └── _util.scss：util系ファイル
│
├── _page：各ページ用
│   └── top：
│       ├── _compornents.scss：トップページ内でよく使うもの(必要なければ削除でいい)
│       └── section01.scss：基本はここに、セクションを分けて書いていく(section02があったら、ファイル作成し、そちらに)
│
├── _parts：共通用
│   ├── _common：共通の中でも、html,body,header,footer
│   │   ├── footer.scss
│   │   ├── header.scss
│   │   └── wrapper.scss：html,body関連css
│   └── _compornents：html,body,headerなど以外
│       ├── animation.scss：アニメーション用
│       ├── compornents.scss：主にここに。menuなど単体で記述が多くなった場合は、別ファルに分けるでもいい
│       ├── loading.scss：ローディング
│       ├── media_query.scss：移動？
│       └── skin.scss：消す？
│
└── style.scss：大元のファイル、ここに全て読み込んで、コンパイル
```
