// pages/fina-message/fina-message.js
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
    let _this = this;
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('sendId', function (data) {
      let id = data.id
      wx.request({
        url: 'http://192.168.0.109:8080/api/docShare/detail/'+id,
        method:"GET",
        header: {
          "content-type": "application/json",
          "Authorization": "Bearer " + app.globalData.token
        },
        success: res => {
          console.log(app.globalData.token)
          _this.setData({
            contData:res.data.data
          })
        }
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

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