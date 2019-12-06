// pages/search/search.js
var app=getApp();
var ip=app.globalData.ip;
const util = require('../debounce/debounce.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    time:{
      start:"2016-01-01",
      end:"",
      searchArry:{
        endDate:" 1"
      }
    }
  }, 
  //
  /**
   * 生命周期函数--监听页面加载
   */
  
  // 取消
  cancel:function(){
    // 返回上一级
    wx.navigateBack({
      delta: 1
    });
  },
  // 查询
  search:function(){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    prevPage.setData({
      page:1,
      searchData: this.data.searchArry 
    })
    prevPage.lodingData(false, false, this.data.searchArry);
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.emit('someEvent', { data: this.data.searchArry });

    // 返回上一级
    wx.navigateBack({
      delta: 1
    });
    
  },
  onLoad: function (options) {
    //  时间设定
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    //  获取年份  
    var Y = date.getFullYear();
    //  获取月份  
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    //  获取当日日期 
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    let end="time.end";
    this.setData({
      [end]:Y + '-' + M + '-' + D 
    })
    
    let that=this;
    new Promise((resolve, reject) => {
      wx.getStorage({
        key: "token",
        success: function (res) {
          resolve(res.data)
        },
        fail: function (error) {
          reject(error)
        }
      })
    }).then(function (token) {
      // 录入单位
      wx.request({
        url: ip+'/api/organization/',
        method:"GET",
        success:function(res){
          if(res.data.code===200){
            that.setData({
              companyArray:res.data.data
            })
          }
        }
      })
      // 常用语句类别
      wx.request({
        url: ip + '/api/statement/type',
        header: {
          // "content-type": "application/json",
          "Authorization": "Bearer " + token
        },
        method: "GET",
        success: function (res) {
          if(res.data.code==200){
            // 请求成功
            that.setData({ 
              selectClass:res.data.data 
            })
          }
        },
        fail: function (error) {
          console.log(error)
        }
      })
    }, function (error) {
      console.log(error)
    })
  },

 
  // 录入单位
  bindcomChange:function(e){
    let indec='searchArry.orgid';
    this.setData({
      [indec]: this.data.companyArray[e.detail.value].id,
      indec: e.detail.value
    })
  },
  // 时间日期
  bindtimeChange: function (e) {
    let date = 'searchArry.startDate';
    let endDate = 'searchArry.endDate';
    this.setData({
      [date]: e.detail.value,
      [endDate]: e.detail.value
    })
  },
  // 语句类别
  bindPickerChange: function (e) {
    let index = 'searchArry.docTypeId';
    this.setData({
      [index]: this.data.selectClass[e.detail.value].id,
      index: e.detail.value
    })
  },
  // 关键词
  breakTosearch: util.debounce(function (e) {
    let inputValue = 'searchArry.keyword';
    this.setData({
      [inputValue]: e.detail.value
    });
  },500),
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