// pages/manEntry/manEntry.js
var app = getApp();
var ip = app.globalData.ip;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rangesd:[{
      id:0,
      name:"全员可见"
    },{
      id:1,
      name:"本单位可见"
    }],
    textCont:1,
    dataArray:[]
  },
  pickerRangeChange:function(e){
    this.setData({
      rangeData: this.data.rangesd[e.detail.value].name,
      rangeId: this.data.rangesd[e.detail.value].id
    })
  },
  addFun:function(){
    this.setData({
      textCont:++this.data.textCont
    })
  },
  reduceFun: function () {
    if(this.data.textCont==1){
      return
    };
    let index = 'cont'+(this.data.textCont-1);
    let contTent ='conTent.'+index;
    this.setData({
      [contTent]:'',
      textCont: --this.data.textCont
    })
    console.log(contTent)
  },
  // 标题
  inputTitle:function(e){
    this.setData({
      title:e.detail.value
    })
  },
  // 摘要
  changeInputText:function(e){
    let cont='conTent'+'.cont'+e.currentTarget.dataset.id;
    this.setData({
        [cont]:e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  // 级别
  pickerlevelChange:function(e){
    this.setData({
      levelData: this.data.level[e.detail.value].name,
      levelId:this.data.level[e.detail.value].id
    })
  },
  // 类型
  pickerTypeChange:function(e){
    this.setData({
      classData: this.data.clAss[e.detail.value].name,
      classId: this.data.clAss[e.detail.value].id
    })
  },
  // 发布时间
  pickerTimeChange:function(e){
    this.setData({
      inputTime:e.detail.value
    })
  },
  // 出处
  sourceChange:function(e){
    this.setData({
      source:e.detail.value
    })
  },
  // 正文
  editorInput:function(e){
    this.setData({
      edtiorContext:e.detail.text
    })
  },
  // 保存到草稿箱
  Savecaogao:function(){
    this.sendManuscript(false,1);
  },
  // 提交
  sendManuscript:function(e,status=0){
    let data=this.data;
    let that=this;
    if (data.conTent){  
      Object.keys(this.data.conTent).map(function(val){
        let id=val.slice(4);
        let text = that.data.conTent[val];
        if(text.trim()){
          that.data.dataArray.push({ id: id, content: text });
        }
      })
    }else{
      //...
    }
    if (!data.classId && !data.levelId && !data.rangeId){
      wx.showModal({
        title: '参数错误',
        content: '请选择必填字段',
      })
      return false
    }
    wx.request({
      url: ip + '/api/document/save',
      header:{
        "Authorization": "Bearer "+this.data.token
      },
      method:"POST",
      data:{
        "title": data.title ? data.title:'',
        "content": data.edtiorContext ? data.edtiorContext:'',
        "typeId": data.classId ? data.classId:'',
        "levelId": data.levelId ? data.levelId:'',
        "remark": data.dataArray ? data.dataArray:'',
        "status": status?status:0, //0发布  1草稿
        "publishTime": data.inputTime ? data.inputTime:'',
        "memo": null,
        "source": data.source ? data.source:'',
        "urllink": "",
        "ranged": data.rangeId ? data.rangeId:0
      },
      success:function(res){
        if(res.data.code==200){
          wx.showToast({
            title: '提交成功',
            success:function(){
              var pages = getCurrentPages(); // 获取页面栈
              var prevPage = pages[pages.length - 2]; // 上一个页面
              prevPage.data.manIndex=1;
              prevPage.loadingData(false, false);
              wx.navigateBack({
                delta: 1
              })
            }
          })
         
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //初始化时间;
    let that = this;
    let date = new Date();
    this.setData({
      startTime: (date.getFullYear() - 3) + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
      endTime: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
    });

    //文稿级别;
    new Promise((resolve, reject) =>{
      wx.getStorage({
        key: 'token',
        success: function (res){
          that.setData({
            token: res.data
          })
          resolve(res.data)
        },
        fail: function () { reject(error) }
      })
    }).then(token => {
      console.log("chengog")
      return new Promise((successd, fail) => {
        wx.request({
          url: ip + '/api/document/level',
          header: {
            "Authorization": "Bearer " + token
          },
          success: function (res) {
            if (res.data.code == 200) {
              that.setData({
                level: res.data.data
              })
              successd(token);
            } else {
              wx.showModal({
                title: '页面出错',
                content: res.data.msg,
                success: function () {
                  wx.redirectTo({
                    url: '/login/index',
                  })
                }
              })
            }
          }
        })
      })
    }, error => { }).then(token => {
      wx.request({
        url: ip + '/api/document/type',
        header: {
          "Authorization": "Bearer " + token
        },
        success: function (res) {
          if (res.data.code == 200) {
            that.setData({
              clAss: res.data.data
            })
          }
        }
      })
    }, fails => { })
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