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
  // 下拉刷新
  onPullDownRefresh: function () {
    console.log("下拉了");
    wx.showNavigationBarLoading();
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
    console.log(e);

    this.setData({
      checkFlag:true
    })
    console.log(this.data.checkFlag)
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
