// pages/manDetails/manDetails.js
const app = getApp()
let ip = app.globalData.ip;
var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    content:''
  },
  onLoad: function (options) {
    let that=this;
    const eventChannel = this.getOpenerEventChannel()
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('details', function (data) {

      that.setData({
        contData: data.data.data,
        content: data.data.data.content
      })
      
      WxParse.wxParse('active', 'html', that.data.content, that);
    })
  },
  // 下载文件
  downloadFiles:function(e){
    let path = e.currentTarget.dataset.url;
    wx.showLoading({
      title: '下载中...',
    });
    wx.downloadFile({
      url: ip + path,
      success(res) {
        console.log(res);
        if (res.statusCode === 200) {
          wx.hideLoading();
        }
      }
    })
  }
})