// pages/components/mytree/mytree.js
Component({
  
  properties: {
    model: Object,
    idd: String,
  },
  data: {
    open: false,
    isBranch: false,
    that:null,
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
      this.setData({
        idd: itid
      })
      wx.setStorageSync("that", that);
      let setStorage = wx.getStorageSync("that");
      if(this.that){
        this.that.setData({
          idd: ''
        })
      }
      this.that = this;
      // var pages = getCurrentPages();
      // var p = pages[pages.length - 2];  //上一个页面
      // if (p.data.setThis && p.data.setThis!=that) {
      //   p.data.setThis.setData({
      //     idd: ''
      //   })
      // }
      // p.setData({
      //   setThis:that
      // })
      
      this.triggerEvent('tapitem', { itemid: itid, name: name, orgid: orgid}, { bubbles: true,composed: true})
    }
  },
  ready: function (e) {
  },
})