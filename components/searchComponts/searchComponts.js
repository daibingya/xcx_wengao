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
  },
  methods: {
    // 跳转搜索页面
    breakTosearch: function (evt) {
      this.triggerEvent("breakTo",{
        success:"点击成功"
      })
    },
  }
})