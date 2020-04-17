//index.js
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
    searchFlage: true,
    manIndex:1,
    searchData:'',
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
    wx.showNavigationBarLoading();
    this.setData({
      keywords:'',
      checkFlag:false,
      checkAllFlag:false,
      manIndex:1,
      searchData:''
    })
    this.loadingData(true,false,false);
  },
  /**
  * 页面上拉触底事件的处理函数
  */
  onReachBottom: function () {
    this.loadingData(false, true, this.data.searchData);
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
  // 加载数据
  loadingData: function (upPull, dowPull, searchCondition){
    let that=this;
    upPull && (that.data.manIndex = 1) && (that.data.searchFlage = true)
    if(!that.data.searchFlage) return false;

    wx.showLoading({
      title: '正在加载...',
    });
    wx.request({
      url: ip + '/api/document/list',
      header: {
        "content-type": "application/json",
        "Authorization": "Bearer " + app.globalData.token
      },
      method: "POST",
      data: {
        "current": dowPull ? ++that.data.manIndex : that.data.manIndex,
        "size": 5,
        "searchCondition": {
          "title": searchCondition ? searchCondition.title : '',
          "categoryId": searchCondition ? searchCondition.categoryId : '',
          "orgid": searchCondition ? searchCondition.orgid : '',
          "tags": searchCondition ? searchCondition.tags : '',
          "docType": searchCondition ? searchCondition.type : '',
          "pubTime": searchCondition ? searchCondition.pubTime : '',
        }
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 200) {
          if (dowPull && res.data.data.records.length <= 0) {
            that.data.searchFlage = false;
            wx.showToast({
              title: '我也是有底线的',
              image: "/image/nofined.png"
            })
          }
          that.setData({
            documentArray: dowPull ? that.data.documentArray.concat(res.data.data.records) : res.data.data.records
          })
          if (upPull) {
            wx.stopPullDownRefresh({
              success: function () {
                wx.showToast({
                  title: '刷新成功',
                })
                wx.hideNavigationBarLoading();
              }
            })
          }
        } else {
          wx.showModal({
            title: '加载失败',
            content: res.data.msg,
            success: function (v) {
              if (!v.cancel) {
                wx.redirectTo({
                  url: '/login/index'
                })
              }
            }
          })
        }
      }, fail: function (error) {
        wx.hideLoading();
        wx.showModal({
          title: "网络问题",
          content: "无网络或服务关闭",
        })
      }
    })
  },
  // 左侧复选框选中的内容（用于生成文稿的数据）
  shengcheng:function(e){
    this.setData({
      sendData:e.detail
    })
  },
  onLoad: function () {
    let that=this;
    wx.getStorage({
      key: 'token',
      success: function(res) {
        app.globalData.token = res.data;
        that.loadingData();
      },
    })
    
  }
})
