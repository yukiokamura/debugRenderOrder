//--------------------------------------------------
//
//  GetData
//
//--------------------------------------------------             

export default class GetData {

  constructor(APIURL) {  

    this.APIURL = APIURL;

    this.onSuccess = ()=>{};
    this.onError = ()=>{};
    this.status = '';

    this.setup();
    this.setEvents();   

  }

  setup() {

    // param
    this.param = {
                    url: this.APIURL,
                    type: 'get',
                    dataType: 'json',
                    data: {
                      // 'page_no': this.page_no,
                      // 'count': this.count,
                      // 'category_slug': this.category_slug,
                      // 'tag_slug': this.tag_slug,
                      // 'area_slug': this.area_slug,
                      // 'author_name': this.author_name,
                      // 'search_word': this.search_word,
                    },
                    timeout: 5000,
                    cache:false
                  };

  }


  run () {

    $.ajax(this.param)
     .then(
      (data)=>{this.onSuccess(data)}, // success
      (data)=>{this.onError(data)} // error
     );

    return $.ajax(this.param);

  }

  setEvents () {


  }

}