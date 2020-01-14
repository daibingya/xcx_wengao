// pages/components/mytree/mytree.js
Component({
  
  properties: {
    model: Object,
    idd: String,
  },
  data: {
    open: false,
    isBranch: false,
    check: true,
    getIdd:''
  },
  observers: {
    'model': function (val,data) {
        this.setData({
          isBranch: Boolean(this.data.model.children && this.data.model.children.length),
        })
    }
  },
  methods: { 
    // 组件内部父级打开事件
    toggle: function (e) {
      console.log(this)
      if (this.data.isBranch) {
        this.setData({
          open: !this.data.open,
        })
      }
    },
    // 组件内部子级的点击事件
    tapItem:function(e){
      let that = this;
      let itid = e.currentTarget.dataset.itemid;
      this.setData({
        idd: itid
      })
      var pages = getCurrentPages();
      var p = pages[pages.length - 2];  //上一个页面
      if (p.data.setThis){
        p.data.setThis.setData({
            idd:''
        })
      }
      p.setData({
        setThis:that
      })  
      this.triggerEvent('tapitem', { itemid: itid}, { bubbles: true,composed: true})
    }
  },
  ready: function (e) {
  },
})