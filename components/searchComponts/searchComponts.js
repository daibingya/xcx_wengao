Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    flag: {
      type: Number,
      value: '',
    },
    values:{
      type:Object,
      value:''
    }
  },
  data: {
    // 这里是一些组件内部数据
    someData: {},
    name:'搜索'
  },
  methods: {
    // 这里是一个自定义方法
    customMethod: function () { },

    // 跳转搜索页面
    breakTosearch: function (evt) {
      this.triggerEvent("breakTo",{
        success:"点击成功"
      })
    },
  }
})