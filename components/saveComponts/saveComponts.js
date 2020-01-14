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
    clickFlag:true
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
    // 保存到文稿 status=0
      this.setData({
        status:0
      })
      this.senData();
    },
    // 保存到草稿 status=1
    conSon:function(){
      this.setData({
        status:1
      })
      this.senData();
    },
    senData:function(){
      let that = this;
      if(!that.data.clickFlag){
        return
      }
      this.setData({
        clickFlag:false
      })
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
        console.log(datas)
        wx.request({
          url: ip + '/api/mydocument/save',
          method: 'POST',
          header: {
            "Authorization": "Bearer " + token
          },
          data: {
            "id" : datas.id ? datas.id : "",
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
                  // 利用generate可以看到需要返回两级还是1级
                  let gernflag = that.data.shouData.generate;
                  wx.navigateBack({
                    delta: gernflag ? 2:1
                  });
                  var pages = getCurrentPages();
                  // 利用generate可以看到需要刷新倒数第2级还是倒数第1级
                  var prevPage = gernflag ? pages[pages.length - 3] : pages[pages.length - 2];  //上一个页面
                  if(!datas.id){
                    prevPage.setData({
                      checkFlag:false,
                      checkAllFlag:false
                    })
                  }else{
                    prevPage.manuScript ? prevPage.manuScript(false, false, false, prevPage.data.url) : prevPage.loadingData(false, false, false, prevPage.data.url)
                  }
                  that.setData({
                    clickFlag:true
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