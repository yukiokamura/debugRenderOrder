## クラス テンプレート

setup() ： 諸々の準備、dom取得  
update()　：　値の更新  
draw() ：　描画に反映  
setEvents() ：　各種イベントの設定  
removeEvents() ：　各種イベントの解除    

```
export default class Controller extends Base {

  constructor() {

    super();

    this.setup();
    this.setEvents();

  }

  setup() {

　　　// dom取得など
　　　this.$target = $('.target')

　　　console.log('setup');

  }

  setEvents() {


  }

  update() {


  }

  draw() {


  }

}
```
