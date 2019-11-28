var app = getApp();
var ip = app.globalData.ip;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    time: {
      start: "2016-01-01",
      end: "",
      searchArry: {
        endDate: " 1"
      }
    }
  },
  // 取消
  cancel: function () {
    // 返回上一级
    wx.navigateBack({
      delta: 1
    });
  },
  // 查询
  search: function () {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    prevPage.setData({
      page: 1,
      searchData: this.data.searchArry
    })
    prevPage.loadingData(false, false, this.data.searchArry);
    const eventChannel = this.getOpenerEventChannel();
    // 搜索栏的搜索词
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
    let end = "time.end";
    this.setData({
      [end]: Y + '-' + M + '-' + D
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
 
  // 关键词
  breakTosearch: function (e) {
    let inputValue = 'searchArry.keyword';
    this.setData({
      [inputValue]: e.detail.value
    });
  },
})