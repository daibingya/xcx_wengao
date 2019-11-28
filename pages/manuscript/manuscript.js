// pages/manuscript/manuscript.js
var app = getApp();
var ip = app.globalData.ip;
Page({
  /**
   * 页面的初始数据
   */
  data: {page:1},
  searchWxml:function(){
    let that=this;
    wx.navigateTo({
      url: '/pages/searchDocument/searchDocument',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        someEvent: function (data) {
          that.setData({
            searchData: data.data
          })
        }
      } 
    })
  },
  // 加载数据
  loadingData:function(down,up,searchData){
    wx.showLoading({
      title: '正在加载...',
    })
    let that = this;
    up && ++this.data.page
    new Promise((resolve, reject) => {
      wx.getStorage({
        key: 'token',
        success: function (res) {
          that.setData({
            token: res.data
          })
          resolve(res.data)
        },
        fail: function () { reject(error) }
      })
    }).then(token => {
      wx.request({
        url: ip + '/api/mydocument/list',
        header: {
          "Authorization": "Bearer " + token
        },
        method: 'POST',
        data: {
          "current": that.data.page,
          "size": 10,
          "searchCondition": {
            "keyword": searchData ? searchData.keyword:"",
            "startDate": searchData ? searchData.startDate:"",
            "endDate":searchData ? searchData.endDate:""
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
            if (down){
              wx.showToast({
                title: '刷新成功',
                success:function(){
                  wx.stopPullDownRefresh()
                }
              })
              that.setData({
                searchData:""
              })
            }
            that.setData({
              mydocument: up ? that.data.mydocument.concat(...res.data.data.records) : res.data.data.records
            })
          };
        },fail:function(error){
          wx.hideLoading();
          wx.showModal({
            title: '请求出错',
            content: error.msg,
          })
        }
      })
    }, error => { })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //文稿级别;
    this.loadingData(false,false,false);
  },
  /**
    * 页面相关事件处理函数--监听用户下拉动作
    */
  onPullDownRefresh: function () {
    this.data.page=1;
    this.loadingData(true,false,false);
  },
  onShareAppMessage: function (res) {
    wx.showLoading({
      title: '正在加载...',
    })
    if (res.from === 'button') {
      wx.hideLoading();
    }
    return {
      title: res.target.dataset.title,
      path: '/pages/mymanDetails/mymanDetails?sendParameter='+res.target.dataset.sid,
      success:function(res){
      },
      fail:function(error){
        console.log(error);
      }
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.loadingData(false, true, this.data.searchData);
  }
})