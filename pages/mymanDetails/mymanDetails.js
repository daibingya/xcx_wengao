// pages/manDetails/manDetails.js
var app = getApp();
var ip = app.globalData.ip;
const util = require('../debounce/debounce.js');

Page({
  data: {
    showFlag:false
  },
  onLoad: function (options) {
    let that=this;
    let sid=options.sendParameter;
    if(sid){
      wx.showLoading({
        title: '加载中...',
      })
      wx.request({
        url: ip + '/api/mydocument/detail/'+sid,
        method:"GET",
        success:function(res){
          wx.hideLoading();
          if(res.data.code==200){
            that.setData({
              contData: res.data.data,
              showFlag:true,
              setDataImage: res.data.data.content.replace(/\<img/gi, '<img style="max-width:100%;height:auto"')
            })
            console.log(res.data.data)
          }else{
            wx.showModal({
              title: '请求错误',
              content: res.data.message,
            })
          };
        },
        fail:function(err){
          wx.hideLoading();
          wx.showModal({
            title: '请求错误',
            content: err.msg,
          })
        }
      })
    }else{
      const eventChannel = this.getOpenerEventChannel();
      try{
          eventChannel.on('details', function (data) {
            let d=data.data.data;
            that.setData({
              contData: d,
              showFlag:true,
              setDataImage: d.content.replace(/\<img/gi, '<img style="max-width:100%;height:auto"')
            })
          })
      }catch(e){console.log(e)}
    }
  },
  longpressEvents: util.longpressEvents,
  // 手动分享
  onShareAppMessage: function (res) {
    console.log(res);
    wx.showLoading({
      title: '正在加载...',
    })
    if (res.from === 'button') {
      wx.hideLoading();
    }
    return {
      title: res.target.dataset.title,
      path: '/pages/mymanDetails/mymanDetails?sendParameter=' + res.target.dataset.sid,
      success: function (res) {
        console.log("转发成功");
        console.log(res);
      },
      fail: function (error) {
        console.log(error);
      }
    }
  }
})