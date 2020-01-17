// pages/manDetails/manDetails.js
const app = getApp()
let ip = app.globalData.ip;
Page({
  data: {
    content:''
  },
  // 分享
  onShareAppMessage: function (res) {
    console.log(res)
    wx.showLoading({
      title: '正在加载...',
    })
    if (res.from === 'button') {
      wx.hideLoading();
    }
    return {
      title: res.target.dataset.title,
      path: '/pages/manDetails/manDetails?sendParameter=' + res.target.dataset.sid,
      success: function (res) {
      },
      fail: function (error) {
        console.log(error);
      }
    }
  },
  onLoad: function (options) {
    let that=this;
    let sid=options.sendParameter;
    console.log("sid："+sid)
    if (sid) {
      wx.showLoading({
        title: '加载中...',
      })
      wx.request({
        url: ip + '/api/document/detail/' + sid,
        method: "GET",
        success: function (res) {
          wx.hideLoading();
          if (res.data.code == 200) {
            that.setData({
              contData: res.data.data,
              setDataImage: res.data.data.content.replace(/\<img/gi, '<img style="max-width:100%;height:auto;" ')
            })
          } else {
            wx.showModal({
              title: '请求错误',
              content: res.data.message,
            })
          };
        },
        fail: function (err) {
          wx.hideLoading();
          wx.showModal({
            title: '请求错误',
            content: err.msg,
          })
        }
      })
    }else{
      const eventChannel = this.getOpenerEventChannel()
      // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
      eventChannel.on('details', function (data) {
        let d=data.data.data
        console.log(data.data.data)
        that.setData({
          contData: d,
          setDataImage: d.content.replace(/\<img/gi, '<img style="max-width:100%;height:auto" ')
        })
      })
    }
  },
  // 下载文件
  downloadFiles:function(e){
    let path = e.currentTarget.dataset.url;
    let fileType = path.slice(+path.lastIndexOf('.')+1);
    wx.showLoading({
      title: '下载中....',
      mask:true
    });
    wx.downloadFile({
      url: ip + path,
      success(res) {
        if (res.statusCode === 200) {
          wx.hideLoading();
          wx.openDocument({
            filePath:  res.tempFilePath,
            fileType:  fileType,
            success:function(res){
              console.log(res)
            },
            fail:function(err){
              wx.showModal({
                title: '下载失败',
                content: err.errMsg
              })
            }
          })
        }
      }
    })
  }
})