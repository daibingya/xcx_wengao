// pages/myDiary/myDiary.js
var app = getApp();
const ip = app.globalData.ip;
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  // 加载数据
  loadingData:function(upPull,downPull){
    let that = this;
    wx.showLoading({
      title: '正在加载...',
    })
    wx.request({
      url: ip + '/api/personalNote/list',
      method: "post",
      header: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + app.globalData.token,
      },
      data: {
        current: 1,
        size: 30
      },
      success: res => {
        wx.hideLoading();
        if (res.data.code === 200) {
          that.setData({
            records: res.data.data.records
          });
          upPull && wx.stopPullDownRefresh()
        }else{
          wx.showModal({
            title: '请求错误',
            content: "请查看res的错误数据",
          })
        }
        wx.hideLoading();
      }
    })
  },
  // 查看详情
  getContent:function(e){
    let content = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../diaryDetails/diaryDetails',
      success: function (res) {
        res.eventChannel.emit('getContent', { data: content })
      }
    })
  },
  onLoad: function (options) {
    this.loadingData();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  // 操作
  operationChange: function (e){
    // 编辑
    let operation = e.target.dataset.operation;
    if ( !operation ) return false;
    let content = e.target.dataset.from;
    let id = e.target.dataset.id;
    if ( operation === "editor" ){
      wx.navigateTo({
        url: '../keepDiary/keepDiary',
        success: function (res) {
          res.eventChannel.emit('sendContent', { data: { 
            id: id, 
            content: content 
            }
          })
        }
      })
    }
    if (operation === "delete" ){
       wx.showModal({
         title: '删除',
         content: '是否删除此日记？',
         success: res => {
           console.log(res)
           if(res.confirm){
             console.log("sdasadasd")
             wx.request({
               url: ip + '/api/personalNote/delete/'+ id,
               header: {
                 "Content-Type": "application/json",
                 "Authorization": "Bearer " + app.globalData.token,
               },
               method: "GET",
               success: res =>{
                 res.data.code === 200 && this.loadingData(false,false)
               }
             })
           }
         }
       })
    }
  },
  onReady: function () {

  },
  jumpTo: function(){
    wx.navigateTo({
      url: '../keepDiary/keepDiary',
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadingData(false,false);
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadingData(true,false);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})