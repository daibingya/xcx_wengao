// pages/retrieval/retrieval.js
var app = getApp();
var ip = app.globalData.ip;
const util = require('../debounce/debounce.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    startTime:'2016-01-01',
    endTime:'',
    kitchenFlag:true,   // 默认不阻止
    treeData: {
      title: '请选择素材分类',
      id: 1,
      children: {}
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //初始化时间;
    let that=this;
    let date = new Date();
    this.setData({ 
      endTime: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
    });
    new Promise((resolve,reject)=>{
      wx.getStorage({
        key: 'token',
        success: function (res) {
          resolve(res.data) 
        }
      })
    }).then(token=>{
      // 素材标签;
      return new Promise((successd, fail) => {
        wx.request({
          url: ip + '/api/document/level',
          header: {
            "Authorization": "Bearer " + token
          },
          success: function (res) {
            if (res.data.code == 200) {
              that.setData({
                level: res.data.data.filter(function(value){
                  return value.tagCate === "标签1"
                }),
                level2: res.data.data.filter(function(value){
                  return value.tagCate === "标签2"
                })
              })
              successd(token);
            } else {
              wx.showModal({
                title: '页面出错',
                content: res.data.message,
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
    },fail=>{}).then(token=>{
      // 类型
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
    },fails=>{})
  },
  //选择单位事件处理函数
  tapItem: function (e) { 
    let d= e.detail;
    console.log(e)
    this.setData({
      categoryId: d.itemid,
      orgid:d.orgid
    }) 
    console.log(this.data)
  },
  // 厨房类型
  bindKitchenChange:function(e){
   
    this.setData({
      KitchenData: this.data.Kitchen[e.detail.value].name,
      kitchenFlag: true
    })
   
  },
  // 获取当前用户所属部门的素材分类
  getdepartmentdata:function(){
    let that = this;
    let url;
    console.log("asda")
    if (app.globalData.orgCode === 'GXQZYS') {

      url = '/api/category/getCateGroupByOrg'
    } else {

      url = '/api/category/getCateByUser'
    }
    wx.request({
      url: ip + url,
      header:{
        "Authorization": "Bearer "  + app.globalData.token 
      },
      method:"GET",
      success:function(res){
        that.data.treeData.children = res.data.data;
        that.setData({
          treeData: that.data.treeData
        })
      }
    })
  },
  // 关键字
  keywordsChange:util.debounce(function (e) {
    this.setData({
      keywords: e.detail.value
    })
  },500),
  //发布时间;
  bindSendChange:function(e){
    this.setData({
      sendTime:e.detail.value
    })
  },
  // 录入时间
  bindInputChange:function(e){
    this.setData({
      inputTime: e.detail.value
    })
  },
  //素材标签1;
  bindlevelChange:function(e){
    this.setData({ 
      levelData:this.data.level[e.detail.value].name,
      levelId: this.data.level[e.detail.value].id
    })
  },
  //素材标签2;
  bindlevelChange2: function (e) {
    this.setData({
      levelData2: this.data.level2[e.detail.value].name,
      levelId2: this.data.level2[e.detail.value].id
    })
  },
  //录入单位;
  // bindCompanyChage:function(e){
  //   console.log(e)
  //   this.setData({
  //     comData: this.data.company[e.detail.value].name,
  //     comId: this.data.company[e.detail.value].id
  //   })
  // },
  //文稿类型;
  bindClassChange: function (e) {
    this.setData({
      classData: this.data.clAss[e.detail.value].name,
      classId: this.data.clAss[e.detail.value].id
    })
  },
  
  //查询;
  searchManuscript:function(){
    let searchCondition={
      title:this.data.keywords,          // 标题
      categoryId: this.data.categoryId.replace(/^NULL_\d+$/,"") ,  // 选中的单位
      orgid: this.data.orgid,            // orgid
      type: this.data.classId,           // 类型
      pubTime: this.data.sendTime,       // 发布时间
      tags: (this.data.levelId ? this.data.levelId : "" ) + "," + (this.data.levelId2 ? this.data.levelId2 : "")
    }
    //获取页面栈
    var pages = getCurrentPages();
    var prePage = pages[pages.length - 2];
    //关键在这里，调用上一页的函数
    prePage.loadingData(false, false, searchCondition);
    prePage.setData({
      searchData: searchCondition,
      keywords: this.data.keywords,
      manIndex:1
    });
    wx.navigateBack()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getdepartmentdata();
  }
})