// login/index.js
var app=getApp();
var ip=app.globalData.ip;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //普通选择器：（普通数组）
    array: ['机关单位', '政法单位', '森林防火单位','公务员','其他'] ,
    username:"",
    password:"",
    checked:false
  },
  // 获取用户名，密码
  updateName:function(e){
    let name = e.currentTarget.dataset.name;
    let nameMap = {}
    nameMap[name] = e.detail && e.detail.value
    this.setData(nameMap)
  },
  //单位选择：
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
    console.log(e.detail.value)
  },
  // 记住密码：
  checkboxChange: function (e) {
    // 存储密码
    if(e.detail.value[0]){
      wx.setStorageSync("user", {
        "username":this.data.username,
        // "password":this.data.password,
        "checked":"true",
        "index":this.data.index
      })
    }else{
      try{
        //清理存储;
        wx.removeStorageSync("user")
      }catch(e){
        console.log(e.errMsg)
      }
    }
  },  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideHomeButton();
    // 获取单位
    var _this=this;
    wx.request({
      url: ip+'/api/organization/',
      method: 'GET',
      success:function(res){
        console.log(res);
        _this.setData({
          array: res.data.data
        })
      },fail:function(error){
        console.log(error.errMsg)
      }
    })

    // 查看是否需要获取密码
    try{
      let user = wx.getStorageSync("user");
      if(user){
        _this.setData({
          username:user.username,
          // password:user.password,
          checked:user.checked,
          index: user.index
        })
      }else{
      }
    }catch(e){
      console.log(e);
    }
  },
  // 登录跳转
  brekPage:function(){
    var _this=this;
    wx.request({
      url: ip+'/api/login',
      header:{
        'content-type':"application/x-www-form-urlencoded"
      },
      method:'POST',
      data:{
        username:this.data.username,
        password:this.data.password,
        orgId:this.data.index     //单位
      },
      success:function(res){
        console.log(_this.data);
        if (res.statusCode==200){
          // 登录成功跳转地址
          if(res.data.code == 200 ){
            //存储Token
            console.log(res.data.data.accessToken)
            new Promise((resolve,reject)=>{
              wx.setStorage({
                key: 'token',
                data: res.data.data.accessToken,
                success:function(){
                  resolve();
                },
                fail:function(error){
                  reject(error);
                }
              })
            }).then(function(){
              // 利用promise确保异步操作成功后再执行跳转
              wx.switchTab({
                url: '/pages/index/index',
              })
            },function(){})
          }else{
            wx.showModal({
              title: '登录失败',
              content: '账号、密码或单位错误'
            })
          }
        }else{
          wx.showModal({
            title: '登录失败',
            content: res.errMsg,
          })
        }
      },fail:function(error){
        wx.showModal({
          title: '登录失败',
          content: "网络请求失败"
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideHomeButton();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  
  onShow: function () {
      wx.hideHomeButton();
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
      console.log(1)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})