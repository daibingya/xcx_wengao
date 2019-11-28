// pages/manDetails/manDetails.js
Page({
  data: {
  },
  onLoad: function (options) {
    let that=this;
    const eventChannel = this.getOpenerEventChannel()
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('details', function (data) {
      that.setData({
        contData: data.data.data
      })
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})