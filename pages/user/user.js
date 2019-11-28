// pages/user/user.js
var app=getApp();
var ip=app.globalData.ip;
Page({
  /**
   * 页面的初始数据
   */
  data: {
      token:"",
      user_url:"/image/user_image/userTx.png",
      userdata:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    // 开启loding加载模态框
    wx.showLoading({
      title: '正在加载....',
      mask:true
    })
    var that=this;
    // 获取个人信息的token
    wx.getStorage({
      key:"token",
      // 获取用户信息;
      success:function(res){
        let token=res.data;
        wx.request({
          url: ip +'/api/userSettings/info',
          header:{
            "content-type":"application/json",
            "Authorization": "Bearer " + token
          },
          success:function(res){
            if(res.data.code==200){
                that.setData({
                  userdata: res.data.data,
                  token: token
                })
                // 关闭加载模态框
                wx.hideLoading();
            }else{
                // 关闭加载模态框
                wx.hideLoading();
                wx.showModal({
                  title: '请求失败',
                  content: res.data.msg,
                  success:function(res){
                    wx.redirectTo({
                      url: '/login/index'
                    })
                  }
                })
            }
          },fail:function(error){
            // 关闭加载模态框
            wx.hideLoading();
            wx.showModal({
              title: '网络问题',
              content: '无网络或服务关闭'
            })
          }
        })
      },fail:function(error){
        // 关闭加载模态框
        console.log(error)
        wx.hideLoading();
        wx.showModal({
          title: '请求失败',
          content: error.errMsg,
          success:function(res){
            wx.redirectTo({
              url: '/login/index'
            })
          }
        });
      }
    })
  },
  // 姓名、电话、密码更改;
  navJump:function(e){
    var that=this;
    var id=e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../userEdit/userEdit?id='+id,
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        acceptDataFromOpenedPage: function (data) {
        }
      },
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        let value;
        if(id=="name"){
          value=that.data.userdata.name
        }else if(id="phone"){
          value = that.data.userdata.phone
        }
        res.eventChannel.emit('userEdit', { data: value })
      }
    })
  },
  // 我的文稿
  myManuscript:function(){
      wx.navigateTo({
        url: '/pages/manuscript/manuscript',
      })
  },
  // 我的草稿
  myDraft:function(){
    wx.navigateTo({
      url: '/pages/myDraft/myDraft',
    })
  },
  // 切换账号
  userSwitch:function(){
    wx.redirectTo({
      url: '/login/index',
    })
  },
  // 修改头像
  openCamera:function(){
    var that=this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath为本地图片地址;
        const tempFilePaths = res.tempFilePaths;
        // 转码base64;
        let base64 = 'data:image/jpeg;base64,' + wx.getFileSystemManager().readFileSync(tempFilePaths[0], "base64");
        wx.request({
          url: ip+'/api/userSettings/updateInfo',
          method:'POST',
          header:{
            "content-type":"application/json",
            "Authorization": "Bearer "+ that.data.token
          },
          data:{
            "avatar": base64
          },
          success:function(res){
            var avatar="userdata.avatar";
            that.setData({
              [avatar]: res.data.data.avatar
            });

          }
        })
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})