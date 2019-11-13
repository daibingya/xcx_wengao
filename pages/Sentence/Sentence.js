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
              // 通过eventChannel向被打开页面传送数据
              res.eventChannel.emit('acceptDataFromOpenerPage', { data: value.data.data})
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
  lodingData: function (opPull, onBoot, parameter){
    var that=this;
    new Promise((resolve, reject) => {
      wx.getStorage({
        key: 'token',
        success: function (res) {
          that.setData({
            token: res.data
          })
          resolve(res.data)
        },
        fail: function (error) { reject(error.errMsg) }
      })
    }).then(token => {
      // 获取数据
      wx.request({
        url: ip + '/api/statement/list',
        method: "POST",
        header: {
          "Authorization": "Bearer " + token
        },
        data: {
          "size": 10,
          "current": that.data.page,
          "searchCondition": {
            "orgId": parameter ? parameter.orgid:"",
            "docTypeId":parameter ? parameter.docTypeId:"",
            "startDate": parameter ? parameter.startDate:"",
            "endDate": parameter ? parameter.endDate:"",
            "keyword": parameter ? parameter.keyword:"" //关键字查询
          }
        },
        success: function (res) {

          if (res.data.code == 200) {
            let datasu,nodata;
            if (opPull){
              datasu = res.data.data.records
            }
            else if(onBoot){
              datasu = that.data.sentenceData.concat(res.data.data.records);
            }else{
              datasu = res.data.data.records
            }
            // 判断有无数据，打开提示信息
            if (datasu.length<=0){
              nodata=true
            }else{nodata=false}

            that.setData({
              pages:res.data.data.pages,
              sentenceData: datasu,
              nodataFlag: nodata
            })
            
            if (opPull) { wx.stopPullDownRefresh({
              success:function(){
                wx.showToast({
                  title: '刷新成功',
                })
                wx.hideNavigationBarLoading();
              }
            })}

            wx.hideLoading();
          } else {
            wx.hideLoading();
            wx.showModal({
              title: '请求失败',
              content: res.data.msg,
              complete:function(){
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
    }, error => {console.log(error) })
  },
  onLoad: function (options) {
    var that=this;
    // 加载loding
    wx.showLoading({
      title: '正在加载...',
      mask: true
    })
    this.lodingData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // wx.startPullDownRefresh()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

 
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 加载数据函数  
    // 参数含义：是否下拉，是否上拉

    if (++this.data.page > this.data.pages) {
      return
    }else{
      this.lodingData(false, true, this.data.searchData)
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})