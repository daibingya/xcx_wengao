// login/index.js
var app=getApp();
var ip=app.globalData.ip;
const util = require('../pages/debounce/debounce.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //普通选择器：（普通数组）
    array: [],
    username:"",
    password:"",
    checked:false
  },
  // 键入用户名，密码
  updateName:util.debounce(function(e){
    let name = e.currentTarget.dataset.name;
    let nameMap = {}
    nameMap[name] = e.detail && e.detail.value
    this.setData(nameMap)
  },300),


  //单位选择：
  bindPickerChange: function (e) {
    this.setData({
      orgId: this.data.array[e.detail.value].id
    })
    for(let i=0;i<this.data.array.length;i++){
      if(this.data.array[i].id==this.data.orgId){
        this.setData({
          index:i
        })
      }
    }
  },



  // 记住密码：
  checkboxChange: function (e) {
    if(e.detail.value[0]){
      this.setData({
        remember: true
      })
    }else{
      this.setData({
        remember: false
      })
    }
  },  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    wx.hideHomeButton();
    // 获取单位
    var _this=this;
    new Promise((resolve,reject)=>{
      wx.request({
        url: ip + '/api/organization/',
        method: 'GET',
        success: function (res) {
          that.setData({
            // array: {name:"请选择单位",id:1,children:res.data.data },
            array:res.data.data
          })
          resolve();
        }, fail: function (error) {
          console.log(error.errMsg)
        }
      })
    }).then(val=>{
      //查看是否存储了用户信息
      console.log(_this.data)
      let user = wx.getStorageSync("user");
      if (user) {
        let index = 0;
        for (let i = 0; i < that.data.array.length; i++) {
          if (that.data.array[i].id == user.orgId) {
            index = i;
            break;
          }
        }
        _this.setData({
          username: user.username,
          checked: user.checked,
          orgId:user.orgId,
          index: index,
          remember:true
        })
      } else {
        _this.setData({
          remember: false
        })
      }
    },error=>{})
  },


  tapItem:function(){console.log(111)},
  // 登录跳转
  brekPage:function(){
    wx.showLoading({
      title: '登录中...',
      mask:true
    })
    var _this=this;
    if(this.data.remember){
      wx.setStorageSync("user", {
        "username": this.data.username,
        "checked": "true",
        "orgId": this.data.orgId
      })
    }else{
      try {
        //清理存储;
        wx.removeStorageSync("user")
      } catch (e) {
        console.log(e.errMsg)
      }
    }
    wx.request({
      url: ip+'/api/login',
      header:{
        'content-type':"application/x-www-form-urlencoded"
      },
      method:'POST',
      data:{
        username:this.data.username,
        password:this.data.password,
        orgId: this.data.array[this.data.index].id     //单位
      },
      success:function(res){
        wx.hideLoading();
        if (res.statusCode==200){
          // 登录成功跳转地址
          if(res.data.code == 200 ){
            //  存储Token
            new Promise((resolve,reject)=>{
              wx.setStorage({
                key: 'token',
                data: res.data.data.accessToken,
                success:function(){
                  resolve(res.data.data.accessToken);
                },
                fail:function(error){
                  reject(error);
                }
              })
            }).then(function(token){
              // 利用promise确保异步操作成功后再执行跳转
              wx.switchTab({
                url: '/pages/index/index',
              })
              // 获取用户信息
              wx.request({
                url: ip + '/api/userSettings/info',
                header: {
                  "content-type": "application/json",
                  "Authorization": "Bearer " + token
                },
                success: function (val) {
                  if (val.data.code == 200) {
                    wx.setStorageSync(
                     "userData",
                      val.data.data
                    )  
                  } else {
                    wx.showModal({
                      title: '请求失败',
                      content: val.data.msg,
                      success: function (res) {
                        wx.redirectTo({
                          url: '/login/index'
                        })
                      }
                    })
                  }
                  // 关闭加载模态框
                  wx.hideLoading();
                }, fail: function (error) {
                  // 关闭加载模态框
                  wx.hideLoading();
                  wx.showModal({
                    title: '网络问题',
                    content: '无网络或服务关闭'
                  })
                }
              })
            },function(){})
          }else{
            wx.showModal({
              title: '登录失败',
              content: res.data.msg
            })
          }
        }else{
          wx.showModal({
            title: '登录失败',
            content: res.errMsg,
          })
        }
      },fail:function(error){
        wx.hideLoading();
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
  onShow: function () {
      wx.hideHomeButton();
  }
})