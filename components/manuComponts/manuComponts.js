Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    myWengao: {
      type: Boolean,
      value: '',
    },
    timeFlag:{
      type:Boolean,
      value:''
    },
    needCheck:{
      type: Boolean,
      value: ''
    }
  },
  data: {
  },
  observers: {
    "needCheck":function(res){
      console.log(res)
    }
  },
  attached:function(){
    console.log(this.data)
  },  
  
  methods: {
    // 这里是一个自定义方法
    customMethod: function () { },
    onLoad: function () {
      console.log(12)
    }
  }
})