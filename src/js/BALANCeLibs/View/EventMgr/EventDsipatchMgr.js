//--------------------------------------------------
//
//  EventMgr
//
//--------------------------------------------------

export default class EventMgr {

  constructor() {
  
     this.cbs = {}; //callbacks

  }

  on(name, cb) {

    if (!this.cbs[name]) this.cbs[name] = [];

    this.cbs[name].push(cb);   

  }

  trigger(name) {

    var cbs = this.cbs[name];
    if (!cbs) return;

    for (var i in cbs) cbs[i]();

  }

}


// ------------------------------------------------------------
//  sample below
// ------------------------------------------------------------

  // class SampleA extends EventMgr {

  //   constructor() {
    
  //     super();

  //   }

  //   a() {

  //     console.log('sampleA a');
      
  //   }

  //   b() {
      
  //     console.log('sampleA b');
      
  //   }

  // }

  // class SampleB extends EventMgr {

  //   constructor() {
    
  //     super();

  //   }

  //   a() {

  //     console.log('sampleB a');
      
  //   }

  //   b() {
    
  //     console.log('sampleB b');
        
  //   }

  // }


  // var a = new SampleA();
  // var b = new SampleB();

  // a.on('test', ()=>{console.log('tets')});
  // a.on('a', ()=>{
  //   b.b();
  //   b.on('b',()=>{a.a();});
  //   b.trigger('b');
  // });
  // a.on('a', ()=>{
  //   b.b();
  //   b.on('b',()=>{a.a();});
  //   b.trigger('b');
  // });
  // a.trigger('a');