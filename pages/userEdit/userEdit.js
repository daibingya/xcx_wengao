// pages/userEdit/userEdit.js
var app=getApp();
var ip=app.globalData.ip;
Page({

  /**
   * 页面的初始数据
   */
  data: {
      id:'',
      name:'',
      phone:'',
      originalPassword:'',
      newPassword:'',
      okPassword:'',
      oldvalue:'',
      value:'',
  },

  // 键盘键入事件
  bindKeyInput:function(e){
      let values=e.detail.value.replace(/\s+/g,"")
      this.setData({
        value: values
      })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    var that = this;
    // 设置id为指定的参数;
    this.setData({
      id: option.id
    });
    let key=option.id;
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on("userEdit", function (data) {
        that.setData({
          value:data.data,
          oldvalue:data.data
        })
    })
    // 动态设定当前页标题
    var title;
    switch (option.id){
      case "name":
          title="修改姓名";
          break; 
      case "phone":
          title="修改电话";
          break;
      case "password":
          title="修改密码";
          break;
    }
    wx.setNavigationBarTitle({
      title: title
    })
  },

  //修改的提交函数;
  preservation:function(){
    if (this.options.id=="name"||this.options.id == "phone") {
        this.preservationName(this.options.id)
    };   
    this.options.id == "password" && this.preservationPassword(this.options.id);
  },
  //姓名，电话修改;
  preservationName:function(id){
      var that=this;
      // 无变化，直接返回;
      if(this.data.oldvalue==this.data.value){
        console.log("无变化")
          wx.navigateBack({
            delta: 1,
          })
      }else{
        // 有变化，需要获取token，执行数据更改请求;
        new Promise((resolve,reject)=>{
          wx.showLoading({
            title: '正在修改...',
          })
          wx.getStorage({
            key: 'token',
            success: function (res) {
                resolve(res.data)
            },fail:function(error){
                reject(error.errMsg)
            }
          })
        }).then(function(token){
          let name=id;
          wx.request({
            url: ip +'/api/userSettings/updateInfo',
            method:"POST",
            header:{
              "content-type": "application/json",
              "Authorization": "Bearer " + token
            },
            data:{
              [name]: that.data.value
            },
            success:function(res){
              
              if(res.data.code==200){
                let username="userdata."+id;
                let pages = getCurrentPages();//当前页面栈
                let prevPage = pages[pages.length - 2];//上一页面
                prevPage.setData({
                  [username]: that.data.value
                });
                wx.hideLoading();
                wx.navigateBack({
                  delta: 1
                })
              }else{
                  wx.showModal({
                    title: '修改失败',
                    content: res.data.message,
                  })
              } 
            },fail:function(error){
              wx.showModal({
                title: '修改失败',
                content: error.errMsg,
              })
            }
          })
        }, function (data) {
          wx.showModal({
            title: "修改失败",
            content: data
          })
        })
      }

  },
  // 监听密码改变;
  sizePass:function(e){
    var that=this;
    let values=e.detail.value.replace(/\s+/g,"");
    if(e.target.dataset.id=='orPass'){
      that.setData({
        originalPassword: values
      })
    };
    if (e.target.dataset.id == 'newPass') {
      that.setData({
        newPassword: values
      })
    };
    if (e.target.dataset.id == 'okPass') {
      that.setData({
        okPassword: values
      })
    };
  },
  //修改密码;
  preservationPassword: function () {
    var that=this;
    if (!this.data.originalPassword.trim()){
        wx.showModal({
          title: '错误提示',
          content: '请输入原密码',
        })
     }else{

        if (!this.data.newPassword.trim()){
          wx.showModal({
            title: '错误提示',
            content: '请输入新密码',
          })
          return 
        }else{
          let reg=/^\d\w{5,17}$/;
          if(!reg.test(this.data.newPassword.trim())){
            wx.showModal({
              title: '错误提示',
              content: '新密码格式不正确',
            })
            return
          }
          if (!this.data.okPassword.trim()) {
            wx.showModal({
              title: '错误提示',
              content: '请输入确认密码',
            })
          }else{
            if (this.data.newPassword.trim() != this.data.okPassword.trim()){
              wx.showModal({
                title: '错误提示',
                content: '两次输入密码不一致',
              })
            }else{
              new Promise((resolve,reject)=>{
                  wx.showLoading({
                    title: '正在修改...',
                  });
                  wx.getStorage({
                    key: 'token',
                    success: function(res) {
                      resolve(res.data)
                    },
                    fail:function(error){
                        reject(error.errMsg)
                    }
                  })
              }).then(function(token){
                  wx.request({
                    url: ip+'/api/userSettings/updatePass',
                    method: "POST",
                    header: {
                      "content-type": "application/json",
                      "Authorization": "Bearer " + token
                    },
                    data:{
                      "newPass": that.data.newPassword,
                      "oldPass": that.data.originalPassword
                    },
                    success:function(res){
                        wx.hideLoading();
                        
                        if(res.data.code==200){
                          console.log(res)
                          wx.reLaunch({
                            url: '/pages/success/success'
                          })
                        }else{
                          wx.showModal({
                            title: '修改失败',
                            content: res.data.message,
                          })
                        }
                    },
                    fail:function(error){
                      wx.hideLoading();
                      wx.showModal({
                        title: '修改失败',
                        content: error.errMsg,
                      })
                    }
                  })
              }, function (data) {
                  wx.hideLoading();
                  wx.showModal({
                    title: '修改失败',
                    content:data,
                  })
              })
            }
          }
        }
    }
  }
})