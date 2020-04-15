// pages/sentenceEditor/sentenceEditor.js
var app=getApp();
var ip=app.globalData.ip;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    textAeat:'',
    editorId:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  // 键盘输入
  inputconso:function(e){
    let keys=e.currentTarget.dataset.id;
    this.setData({
      [keys]:e.detail.value
    })
  },
  // select选择
  pickerChange:function(e){
    this.setData({
      index:e.detail.value
    })
  },
  // 页面加载完毕
  onLoad: function (options) {
    let that=this;
    const eventChannel = this.getOpenerEventChannel();
    //  时间设定
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    //  获取年份  
    var Y = date.getFullYear();
    //  获取月份  
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    //  获取当日日期 
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    this.setData({
      time: Y + '-' + M + '-' + D
    })
    new Promise((resolve, reject) => {
      wx.getStorage({
        key: 'token',
        success: function (res) {
          that.setData({token:res.data})
          resolve(res.data);
        },
        fail: function (error) {
          reject(error);
        }
      })
    }).then(function (token) {
      // 常用语句类别
      return new Promise((resolve,reject)=>{
          wx.request({
            url: ip + '/api/statement/type',
            header: {
              "Authorization": "Bearer " + token
            },
            method: "GET",
            success: function (res) {
              console.log(res);
              if (res.data.code == 200) {
                // 请求成功
                that.setData({
                  selectClass: res.data.data
                })
                resolve(res.data.data)
              }
            },
            fail: function (error) {
              console.log(error)
            }
          })
      })
    }, function () { console.log("失败") }).then(function(value){
        // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
      eventChannel.on('changyong', function (data) {
          wx.setNavigationBarTitle({
            title: '编辑'
          });
          
          let typeIdvalue=value.filter(function(val,index){
            return val.id==data.data.typeId
          })
          let typeIdIndex=0;
          for (let i=0;i<value.length;i++){
            if (value[i] == typeIdvalue[0]){
              typeIdIndex=i;
              break
            }
          }
          that.setData({
              textAeat: data.data.cont,
              editorId: data.data.id,
              index: typeIdIndex
            })
        })
    })
  },
  // 保存到草稿/保存
  saveSentence:function(e){
    let that=this;
    let status=0;
    // 保存到草稿;
    if(e.currentTarget.dataset.id=="saveCg"){
      status = 1
    // 保存
    } else if (e.currentTarget.dataset.id == "save"){
      status = 0
    };
    if (!this.data.selectClass[this.data.index]){
      wx.showModal({
        title: '错误提示',
        content: '未选择语句类型',
      })
      return
    }
    wx.showLoading({
      title: '正在存储...',
    })
    let id = this.data.editorId;
    wx.request({
       url: ip + '/api/statement/save',
       method:"POST",
       header:{"Authorization":"Bearer "+this.data.token},
       data:{
         "id":id,
         "status":status,
         "typeId":this.data.selectClass[this.data.index].id,
         "content": this.data.textAeat
       },
       success:function(res){
         if(res.data.code==200){
            wx.hideLoading();
            wx.showToast({
              title: '保存成功',
              success:function(){
                // 草稿箱的编辑
                let pages = getCurrentPages();
                let prevPage = pages[pages.length - 2];
                if(that.data.editorId){
                  prevPage.data.sentenceIndex=1;
                  prevPage.sentEnce();
                }else{
                  //重新加载
                  prevPage.data.page=1;
                  prevPage.lodingData(false,false,false);
                }
                wx.navigateBack({
                  delta: 1
                })
              }
            })
         }else{
           wx.showModal({
             title: '保存错误',
             content: res.data.errMsg,
           })
         }
       },fail:function(){
         wx.hideLoading();
         wx.showModal({
           title: '保存错误',
           content: res.data.errMsg,
         })
       }
     })
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