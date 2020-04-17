//app.js
App({
  onLaunch: function (options) {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  onShow: function(){
    this.getToken();
  },
  getToken: function(){
    // 获取token
    new Promise((resolve, err) => {
      wx.getStorage({
        key: 'token',
        success: function (res) {
          resolve(res.data)
        },
      })
    }).
      then(token => {
        this.globalData.token = token
        wx.request({
          url: this.globalData.ip + '/api/userSettings/info',
          header: {
            "content-type": "application/json",
            "Authorization": "Bearer " + token
          },
          success: res => {
            // 获取单位标示
            this.globalData.orgCode = res.data.data.orgCode
            console.log(res.data.data.orgCode)
          }
        })
      })
  },
  globalData: {
    userInfo: null,
    // ip:"http://192.168.0.70:8080",
    ip:"https://www.xagxqwgdsj.cn",
  }
})