// pages/keepDiary/keepDiary.js
const util = require('../debounce/debounce.js');
const app = getApp()
let ip = app.globalData.ip;
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
    let that = this;
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('sendContent', function (data) {
      that.setData({
        ids: data.data.id,
        contents:data.data.content
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
  textChage: util.debounce(function (e){
    this.setData({
      contents: e.detail.value 
    })
  },500),
  // 提交
  sendDiary:function(){
    if (this.data.contents === "" || !this.data.contents){
      return false
    }
    wx.request({
      url: ip + '/api/personalNote/save',
      header:{
        "Content-Type": "application/json",
        "Authorization": "Bearer "+ app.globalData.token
      },
      method:"post",
      data:{
        id: this.data.ids ? this.data.ids: '',
        content: this.data.contents
      },
      success: res => {
        if (res.data.code === 200){
          wx.navigateBack()
        }
      }
    })
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