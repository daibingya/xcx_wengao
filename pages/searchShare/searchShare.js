// pages/searchShare/searchShare.js
var app = getApp();
const ip = app.globalData.ip;
const util = require('../debounce/debounce.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    kitchenFlag: false,
    id: 0,
    orgId:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.literayStyle();
    this.getKitchen();
  },
  // 厨房类型
  tapItem: function(e){
    this.setData({
      orgId: e.detail.itemid
    })
  },
  // 素材分类
  getKitchen: function(){
    let that = this;
    wx.request({
      url: ip + '/api/organization/business',
      header: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + app.globalData.token,
      },
      method: 'GET',
      success: res => {
        console.log(res)
        if(res.data.code === 200){
          that.setData({
            treeData: {
              name:"请选择素材分类",
              id:"000",
              children:res.data.data
            }
          })
        }
      }
    })
  },
  // 输入标题
  titleChange: util.debounce(function (e) {
    this.setData({
      title: e.detail.value
    })
  }, 500),
  // 选定文体类型
  bindClassChange: function(e){
    this.setData({ 
      classData: this.data.clAss[e.detail.value].name,
      classId: this.data.clAss[e.detail.value].id
    })
  },
  // 定稿时间
  bindInputChange: function(e){
    this.setData({ 
      startTime: e.detail.value,
      endTime: e.detail.value
    })
  },
  // 查询
  searchManuscript: function(e){
    console.log(this.data.orgId)
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.emit("getPrames", {
      prames: {
          title: this.data.title,
          classId: this.data.classId,
          startTime: this.data.startTime,
          endTime: this.data.endTime,
          orgId: this.data.orgId
      } 
    });
    wx.navigateBack()
  },
  // 取消
  cacelChange: function(){
    wx.navigateBack()
  },
  // 文体类型数据获取
  literayStyle: function (){
    let that = this;
    wx.request({
      url: ip + "/api/document/type",
      header: {
        "content-type": "application/json",
        "Authorization": "Bearer " + app.globalData.token
      },
      success: res => {
        if(res.data.code === 200){
          that.setData({
            clAss: res.data.data
          })
        }
      }
    })
  }
})