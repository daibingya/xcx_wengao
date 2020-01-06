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
    treeData: {
      title: '请选择单位',
      id: 1,
      children: {}
    }
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
    //初始化时间;
    let that=this;
    let date = new Date();
    this.setData({ 
      endTime: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
    });

    //文稿级别;
    new Promise((resolve,reject)=>{
      wx.getStorage({
        key: 'token',
        success: function(res) {
          that.setData({
            token:res.data
          })
          resolve(res.data)
        },
        fail:function(){reject(error)}
      })
    }).then(token=>{
      return new Promise((successd,fail)=>{
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
    },error=>{}).then(token=>{
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

      // 单位
      wx.request({
        url: ip + '/api/document/orglist',
        method: 'GET',
        header: {
          "Authorization": "Bearer " + token
        },
        success: function (res) {
          that.data.treeData.children = res.data.data;
          that.setData({
            treeData: that.data.treeData
          })
        }, fail: function (error) {
        }
      })
    },fails=>{})
    // 录入单位
    // wx.request({
    //   url: ip + '/api/organization/',
    //   method: 'GET',
    //   success: function (res) {
    //     that.setData({
    //       company: res.data.data
    //     })
    //   }, fail: function (error) {
    //   }
    // })

    
  },
  //事件处理函数
  tapItem: function (e) { 
    let id=e.detail.itemid;
    this.setData({
      comId: e.detail.itemid
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
  //文稿级别;
  bindlevelChange:function(e){
    this.setData({ 
      levelData:this.data.level[e.detail.value].name,
      levelId: this.data.level[e.detail.value].id
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
      title:this.data.keywords,
      orgid: this.data.comId,
      level: this.data.levelId,
      type: this.data.classId,
      createdDate: this.data.inputTime,
      pubTime: this.data.sendTime
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
    console.log(searchCondition)
    wx.navigateBack({
      delta: 1
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  }
})