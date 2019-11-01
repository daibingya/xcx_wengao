// pages/myDraft/myDraft.js
var app=getApp();
var ip=app.globalData.ip;
Page({

  /**
   * 页面的初始数据
   */
  data: {
      textActive:true
  },
  // 操作
  goEditor:function(e){
    let that=this;
    let name = e.target.dataset.name;
  
    if (name =="editorText"){
      // 编辑
      let id=e.target.dataset.id;
      let cont = e.target.dataset.cont;
      let typeId = e.target.dataset.typeid;

      wx.navigateTo({
        url: "/pages/sentenceEditor/sentenceEditor",
        success: function (res) {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit('acceptDataFromOpenerPage', { data: {
            id:id,
            cont: cont,
            typeId: typeId
          } })
        }
      })
    } else if (name == "delete"){
      // 删除
      let id = e.target.dataset.id;
      console.log(id);
      wx.showModal({
        title: '删除提示',
        content: '是否确定删除？',
        success:function(res){
         if(res.confirm){
           wx.request({
             url: ip + '/api/statement/delete/' + id,
             method:"GET",
             header:{
              "Authorization": "Bearer "+that.data.token
             },
             success:function(res){
               if(res.data.code==200){
                 wx.showToast({
                   title: '删除成功',
                 });
                 that.sentEnce();
               };
             },
             fail:function(err){
               console.log(err)
             }
           })
         }
        }
      })
    }
   
  },
  activeBox:function(e){
    e.target.dataset.id == "wengao" && this.setData({ textActive: true }) && this.manuScript();
    if(e.target.dataset.id == "yuju"){
      this.setData({ textActive: false })
      this.sentEnce();
    };
  },
  // 加载常用语句
  sentEnce:function(){
      let that=this;
      wx.showLoading({
        title: '加载中...',
      });
      new Promise((resolve,reject)=>{
        wx.getStorage({
          key: 'token',
          success: function(res) {
            that.setData({
              token:res.data
            });
            resolve(res.data);
          },
        })
      }).then(token=>{
        wx.request({
          url: ip+'/api/statement/mydraft',
          method:"POST",
          header:{
            "Authorization": "Bearer "+token
          },
          data:{
            "size": 20,
            "current":1,
            "searchCondition": {
              "orgId":"",
              "startDate": "",
              "endDate": "",
              "keyword": "" //关键字查询
            }
          },
          success:function(res){
            console.log(res.data.data.records)
            if(res.data.code==200){
              that.setData({
                sentenceData:res.data.data.records
              })
            };
            wx.hideLoading();
          }
        })
      },error=>{
        wx.showModal({
          title: '请求错误',
          content: error.errMsg,
        })
      })
  },
  // 加载文稿
  manuScript:function(){

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})