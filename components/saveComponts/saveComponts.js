var app = getApp();
var ip = app.globalData.ip;
Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    showFlag: {
      type: Boolean,
      value: '',
    },
    sendCont:{
      type:Object,
      value:''
    }
  },
  data: {
  },
  observers: {
    // 控制全选列表
    "showFlag": function (res) {
      this.setData({
        indexFlag: res
      })
    },
    "sendCont":function(res){ 
      this.setData({
        shouData: res
      })
    }
  },
  ready: function () {

  },
  methods: {
    conWen:function(){
      // 发布状态 status=1
      this.setData({
        status:1
      })
      this.senData();
    },
    // 保存到草稿 status=0;
    conSon:function(){
      this.setData({
        status:0
      })
      this.senData();
    },
    senData:function(){
      let that = this;
      let datas = this.data.shouData;
      new Promise((resolve, reject) => {
        wx.getStorage({
          key: 'token',
          success: function (res) {
            that.setData({
              token: res.data
            })
            resolve(res.data)
          },
          fail: function () { reject(error) }
        })
      }).then(token => {
        wx.request({
          url: ip + '/api/mydocument/save',
          method: 'POST',
          header: {
            "Authorization": "Bearer " + token
          },
          data: {
            "title": datas.title,
            "content": datas.content,
            "status": that.data.status,
            "memo": ""
          },
          success: function (res) {
            if (res.data.code == 200) {
              wx.showToast({
                title: '保存成功！',
                success: function () {
                  wx.navigateBack({
                    delta: 1
                  });
                  var pages = getCurrentPages();
                  var prevPage = pages[pages.length - 2];  //上一个页面
                  prevPage.setData({
                    checkFlag:false
                  })
                }
              })
            } else {
              wx.showModal({
                title: '保存失败',
                content: res.data.msg,
              })
            }
          }
        })
      }, error => { })
    },
    // 取消
    preventD: function () {
      this.setData({
        indexFlag: false
      })
    }
  }
})