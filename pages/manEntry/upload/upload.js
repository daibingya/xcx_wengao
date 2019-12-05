// pages/manEntry/upload/upload.js
var app = getApp();
var ip = app.globalData.ip;
Page({

  /**
   * 页面的初始数据
   */
  data: {
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
  },
  onReady:function(){
    var that=this;
    wx.getStorage({
      key: 'token',
      success: function (res) {
        that.setData({
          url: 'http://192.168.0.253:8080/demo?' + res.data
        })
      },
      fail: function () { }
    })
  },

})