//index.js
//获取应用实例
const app = getApp()
let ip=app.globalData.ip;
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    timeFlag:false,
    shareFlag:false,
    checkFlag:false,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  // 新建文稿
  newPages:function(){
    wx.navigateTo({
      url: '/pages/manEntry/manEntry',
    })
  },
  // 全选
  changeSelect:function(e){
    if(e.detail.value.length!=0){
      this.setData({
        checkAllFlag:true
      })
    }else{
      this.setData({
        checkAllFlag: false
      })
    }
  },
  // 打开询问模态框
  alertModel:function(){
    var that=this;
    if (!this.data.sendData || this.data.sendData.length <= 0) {
      wx.showToast({
        title: '无文稿内容，请先选择',
        icon: 'none',
        duration: 500
      })
    }else{
      wx.showModal({
        title: '生成文稿',
        content: '是否将所选内容生成文稿？',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/generation/generation',
              success: function (res) {
                console.clear();
                console.log(res);
                res.eventChannel.emit('acceptDataFromOpenerPage', { data: that.data.sendData })
              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.setData({
      keywords:'',
      checkFlag:false
    })
    this.loadingData(true);
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  // 搜索跳转
  jumpTo:function(){
    wx.navigateTo({
      url:"/pages/retrieval/retrieval"
    })
  },
  // 选择框显示隐藏
  selectCheck:function(e){
    this.setData({
      checkFlag:!this.data.checkFlag
    })
    if(!this.data.checkFlag){
      this.setData({ 
        checkAllFlag: false,
        checked:false 
      })
    }
  },
  changeSelectBox:function(e){
    this.setData({
      checked:e.detail
    })
  },
  // 加载数据
  loadingData: function (down, up, searchCondition){
    let that=this;
    wx.showLoading({
      title: '正在加载...',
    });
    new Promise((resolve, reject) => {
      wx.getStorage({
        key: 'token',
        success: function (res) {
          resolve(res.data)
        },
      })
    }).then(token => {
      wx.request({
        url: ip + '/api/document/list',
        header: {
          "content-type": "application/json",
          "Authorization": "Bearer " + token
        },
        method: "POST",
        data: {
          "current": 1,
          "size": 10,
          "searchCondition": {
            "title": searchCondition ? searchCondition.title:'',
            "orgid": searchCondition ? searchCondition.orgid : '',
            "level": searchCondition ? searchCondition.level : '',
            "type": searchCondition ? searchCondition.type : '',
            "createdDate": searchCondition ? searchCondition.createdDate : '',
            "pubTime": searchCondition ? searchCondition.pubTime : ''
          }
        },
        success: function (res) {
          if (res.data.code == 200) {
            that.setData({
              documentArray: res.data.data.records
            })
            if(down){
              wx.showToast({
                title: '刷新成功'
              })
              wx.stopPullDownRefresh();
              wx.hideNavigationBarLoading();
            }
          }else{
            wx.showModal({
              title: '加载失败',
              content: res.data.msg,
              success:function(v){
                wx.redirectTo({
                  url: '/login/index'
                })
              }
            })
          }
          wx.hideLoading();
        }, fail: function (error) {
          wx.hideLoading();
          wx.showModal({
            title: '加载失败',
            content: error.errMsg,
          })
        }
      })
    }, error => { console.log(error)})
  },
  // 用于生成文稿的数据
  shengcheng:function(e){
    this.setData({
      sendData:e.detail
    })
    console.log(e.detail)
  },
  onLoad: function () {
    let that=this;
    this.loadingData();
  }
})
