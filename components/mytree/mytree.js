// pages/components/mytree/mytree.js
var app = getApp();
Component({
  
  properties: {
    model: Object,
    idd: String,
  },
  data: {
    open: false,
    isBranch: false,
    that:null,
    indexs:0,
    getIdd:''
  },
  observers: {
    'model': function (val,data) {
        this.setData({
          isBranch: Boolean(this.data.model && this.data.model.children && this.data.model.children.length),
        })
    }
  },
  methods: { 
    // 组件内部父级打开事件
    toggle: function (e) {
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
      let name = e.currentTarget.dataset.name;
      let orgid = e.currentTarget.dataset.orgid;
      
      if (app.globalData.that) {
        app.globalData.that.setData({
          idd: ''
        })
      }
      this.setData({
          idd: itid
      })
      wx.showToast({
        title: name,
      })
      
      app.globalData.that = that;
      
      this.triggerEvent('tapitem', { itemid: itid, name: name, orgid: orgid}, { bubbles: true,composed: true})
    }
  },
  ready: function (e) {
  },
})