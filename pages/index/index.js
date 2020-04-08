//index.js
//获取应用实例
const app = getApp()
let ip=app.globalData.ip;
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    timeFlag:false,
    shareFlag:false,
    checkFlag:false,
    hasUserInfo: false,
    manIndex:1,
    searchData:'',
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  // 新建文稿
  newPages:function(){
    wx.navigateTo({
      url: '/pages/manEntry/manEntry',
    })
  },
  // 全选
  changeSelect:function(e){
    if(e.detail.value.length!=0){
      this.setData({
        checkAllFlag:true
      })
    }else{
      this.setData({
        checkAllFlag: false
      })
    }
  },
  // 打开询问模态框
  alertModel:function(){
    var that=this;
    if (!this.data.sendData || this.data.sendData.length <= 0) {
      wx.showToast({
        title: '无文稿内容，请先选择',
        icon: 'none',
        duration: 500
      })
    }else{
      wx.showModal({
        title: '生成文稿',
        content: '是否将所选内容生成文稿？',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/generation/generation',
              success: function (res) {
                console.clear();
                console.log(that.data.sendData);
                res.eventChannel.emit('sendContent', { data: {name:"",array:that.data.sendData}})
              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.setData({
      keywords:'',
      checkFlag:false,
      checkAllFlag:false,
      manIndex:1,
      searchData:''
    })
    this.loadingData(true,false,false);
  },
  /**
  * 页面上拉触底事件的处理函数
  */
  onReachBottom: function () {
    this.loadingData(false, true, this.data.searchData);
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  // 搜索跳转
  jumpTo:function(){
    wx.navigateTo({
      url:"/pages/retrieval/retrieval"
    })
  },
  // 选择框显示隐藏
  selectCheck:function(e){
    this.setData({
      checkFlag:!this.data.checkFlag
    })
    if(!this.data.checkFlag){
      this.setData({ 
        checkAllFlag: false,
        checked:false 
      })
    }
  },
  changeSelectBox:function(e){
    this.setData({
      checked:e.detail
    })
  },
  // 加载数据
  loadingData: function (down, up, searchCondition){
    let that=this;
    wx.showLoading({
      title: '正在加载...',
    });
    up && ++that.data.manIndex
    new Promise((resolve, reject) => {
      wx.getStorage({
        key: 'token',
        success: function (res) {
          resolve(res.data)
        },
      })
    }).then(token => {
      wx.request({
        url: ip + '/api/document/list',
        header: {
          "content-type": "application/json",
          "Authorization": "Bearer " + token
        },
        method: "POST",
        data: {
          "current": that.data.manIndex,
          "size": 5,
          "searchCondition": {
            "title": searchCondition ? searchCondition.title:'',
            "categoryId": searchCondition ? searchCondition.categoryId : '',
            "orgid": searchCondition ? searchCondition.orgid : '',
            "tags": searchCondition ? searchCondition.level : '',
            "docType": searchCondition ? searchCondition.type : '',
            "createdDate": searchCondition ? searchCondition.createdDate : '',
            "pubTime": searchCondition ? searchCondition.pubTime : '',
          }
        },
        success: function (res) {
          wx.hideLoading();
          if (res.data.code == 200) {
            if(up && res.data.data.records.length<=0){
              wx.showToast({
                title: '我也是有底线的',
                image:"/image/nofined.png"
              })
            }
            that.setData({
              documentArray: up ? that.data.documentArray.concat(...res.data.data.records) : res.data.data.records
            })
            if(down){
              wx.stopPullDownRefresh({
                success: function () {
                  wx.showToast({
                    title: '刷新成功',
                  })
                  wx.hideNavigationBarLoading();
                }
              })
            }
          }else{
            wx.showModal({
              title: '加载失败',
              content: res.data.msg,
              success:function(v){
                if(!v.cancel){
                  wx.redirectTo({
                    url: '/login/index'
                  })
                }
              }
            })
          }
        }, fail: function (error) {
          wx.hideLoading();
          wx.showModal({
            title: "网络问题",
            content: "无网络或服务关闭",
          })
        }
      })
    }, error => { console.log(error)})
  },
  // 左侧复选框选中的内容（用于生成文稿的数据）
  shengcheng:function(e){
    this.setData({
      sendData:e.detail
    })
  },
  onLoad: function () {
    let that=this;
    this.loadingData();
  }
})
