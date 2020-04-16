// pages/Sentence/Sentence.js
var app=getApp();
var ip=app.globalData.ip;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    sentenceData:[],
    page:1,
    searchFlag: true,
    nodataFlag:false
  },
  // 跳转页面
  senBreak:function(e){
    var that=this;
    wx.navigateTo({
      url: '/pages/search/search',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        someEvent: function (data) {
          that.setData({
            searchData:data.data
          })
        }
      } 
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  goMessage:function(e){
    let that=this;
    if(e.target.id){
      wx.showLoading({
        title: '加载中...',
      })
      wx.request({
        url: ip+'/api/statement/detail/' + e.target.id,
        header:{
          "Authorization": "Bearer "+that.data.token
        },
        method:'GET',
        success:function(value){
          wx.navigateTo({
            url: '/pages/details/details',
            success: function (res) {
              res.eventChannel.emit('sendSentence', { data: value.data.data})
              wx.hideLoading();
            }
          })
        }
      })
    }
  },
  // 新建常用语句
  newSentence:function(){
    wx.navigateTo({
      url: '/pages/sentenceEditor/sentenceEditor',
    })
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    // 加载数据调用
    // 参数含义：是否下拉，是否上拉
    this.setData({
      page: 1,
      searchData: false
    })
    this.lodingData(true,false);
  },
  
  // 加载数据
  lodingData: function (upPull, downPull, parameter){
    var that=this;
    upPull && (that.data.page = 1) && (that.data.searchFlag = true)
    if (!that.data.searchFlag) return false;

    wx.showLoading({
      title: '加载中...',
    })
    // 获取数据
    wx.request({
      url: ip + '/api/statement/list',
      method: "POST",
      header: {
        "Authorization": "Bearer " + app.globalData.token
      },
      data: {
        "size": 10,
        "current": downPull ? ++that.data.page : that.data.page,
        "searchCondition": {
          "orgId": parameter ? parameter.orgid : "",
          "docTypeId": parameter ? parameter.docTypeId : "",
          "startDate": parameter ? parameter.startDate : "",
          "endDate": parameter ? parameter.endDate : "",
          "keyword": parameter ? parameter.keyword : "" //关键字查询
        }
      },
      success: function (res) {
        wx.hideLoading();
        let nodata = false;
        if (res.data.code == 200) {
          if (downPull && res.data.data.records.length <= 0) {
            that.data.searchFlag = false;
            wx.showToast({
              title: '我也是有底线的',
              image: "/image/nofined.png"
            })
          }
          if (!downPull && res.data.data.records.length <= 0) {
            nodata = true
          }
          that.setData({
            sentenceData: downPull ? that.data.sentenceData.concat(res.data.data.records) : res.data.data.records,
            nodataFlag: nodata
          })
          // 下拉刷新
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
            title: '请求失败',
            content: res.data.msg,
            complete: function () {
              wx.redirectTo({
                url: '/login/index'
              })
            }
          })
        };
      },
      fail: function (error) {
        wx.hideLoading();
        wx.showModal({
          title: '请求失败',
          content: error.errMsg
        })
      }
    })
    
  },
  onLoad: function (options) {
    var that=this;
    // 加载loding
    wx.showLoading({
      title: '正在加载...',
      mask: true
    })
    this.lodingData(false,false,false);
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 加载数据函数  
    // 参数含义：是否下拉，是否上拉
    this.lodingData(false, true, this.data.searchData)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})