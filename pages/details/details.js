// pages/details/details.js
const util = require('../debounce/debounce.js');
Page({
  data: {},
  onLoad: function (options) {
    var that=this;
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('sendSentence', function (data) {
      that.setData({
        detailsData:data.data
      })
    })
  },
  longpressEvents: util.longpressEvents,
})