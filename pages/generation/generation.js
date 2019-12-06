// pages/generation/generation.js
const util = require('../debounce/debounce.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:"",
    textAreat: '',
    indexFlag:false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('sendContent', function (data) {
       let innerText='';
       data.data.array.forEach((val,index)=>{
         innerText+=val.text+'\n';
       })
       that.setData({
         title:data.data.name,
         textAreat:innerText,
         id:data.data.id
       })
    })
  },
  // 预览
  previewMan:function(){
    let datas=this.data;
    if (!this.data.title || !this.data.textAreat) {
      wx.showToast({
        title: '请输入标题或内容',
        icon: 'error'
      })
      return
    }
    wx.navigateTo({
      url: '/pages/preview/preview',
      success:function(res){
        console.log(datas.textAreat);
        res.eventChannel.emit('openpage', { data: { title: datas.title, content: datas.textAreat} })
      }
    })
  },
  //保存;
  sendManuscript:function(){
    if (!this.data.title || !this.data.textAreat){
      wx.showToast({
        title: '请输入标题或内容',
        icon:'none'
      })
      return
    }
    this.setData({
      indexFlag:true,
      sendCont:{
        title: this.data.title,
        content:this.data.textAreat,
        id:this.data.id
      }
    });
  },
  // 标题键入
  titleChange: util.debounce(function(e){
    this.setData({
      title: e.detail.value
    })
  },1000),
  // 内容键入
  textareaChange:util.debounce(function(e){
    this.setData({
      textAreat: e.detail.value
    })
  },1000),
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})