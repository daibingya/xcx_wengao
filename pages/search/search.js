// pages/search/search.js
var app=getApp();
var ip=app.globalData.ip;
const util = require('../debounce/debounce.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    time:{
      start:"2016-01-01",
      end:"",
      searchArry:{
        endDate:" 1"
      }
    },
    treeData: {
      title: '请选择素材分类',
      id: 1,
      children: {}
    }
  }, 
  //
  /**
   * 生命周期函数--监听页面加载
   */
  
  // 取消
  cancel:function(){
    // 返回上一级
    wx.navigateBack({
      delta: 1
    });
  },
  // 查询
  search:function(){
    let that = this;
    let searchCondition= {
      orgId: that.data.oid ? that.data.oid : "",
      categoryId: that.data.cid ? that.data.cid.replace(/^NULL_\d+$/, "") : "",
      startDate: that.data.startDate ? that.data.startDate : "",
      endDate: that.data.endDate ? that.data.endDate : "",
      tags: that.data.tags ? that.data.tags.replace(/undefined/ig, "") : "",
      keyword: that.data.keyword ? that.data.keyword: ""
    }
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];

    let tags = this.data.biaoData1Id + "," + this.data.biaoData2Id;
    // let t = "searchArry.tags";
    this.setData({
      tags : tags
    })
    prevPage.setData({
      page:1,
      searchData: searchCondition
    })
    prevPage.lodingData(false, false, searchCondition);
    
    wx.navigateBack()
  },
  onLoad: function (options) {
    //  时间设定
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    //  获取年份  
    var Y = date.getFullYear();
    //  获取月份  
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    //  获取当日日期 
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    let end="time.end";
    this.setData({
      [end]:Y + '-' + M + '-' + D 
    })
    let that=this;
    new Promise((resolve, reject) => {
      wx.getStorage({
        key: "token",
        success: function (res) {
          resolve(res.data)
        },
        fail: function (error) {
          reject(error)
        }
      })
    }).then(function (token) {
      // 如果是政研室
      let url;
      if (app.globalData.orgCode === "GXQZYS"){
        url = '/api/statementcategory/getCateGroupByOrg';
      }else{
        url = '/api/statementcategory/getCateByUser';
      }
      // 素材分类
      wx.request({
        url: ip + url,
        header:{
          "Authorization": "Bearer "+ token
        },
        method:"GET",
        success:function(res){
          that.data.treeData.children = res.data.data;
          that.setData({
            treeData: that.data.treeData
          })
        }
      })
      // 文体类型
      wx.request({
        url: ip + '/api/statement/type',
        header: {
          "Authorization": "Bearer " + token
        },
        method: "GET",
        success: function (res) {
          if(res.data.code==200){
            // 请求成功
            that.setData({ 
              selectClass:res.data.data 
            })
          }
        },
        fail: function (error) {
          console.log(error)
        }
      })
      // 获取素材标签
      wx.request({
        url: ip + '/api/statementcategory/tag',
        header: {
          "Authorization": "Bearer " + token
        },
        method:"GET",
        success: res => {
          if(res.data.code === 200){
            let data = res.data.data;
            that.setData({
                biao1: data.filter(v => {
                  return v.tagCate === "标签1"
                }),
                biao2: data.filter(v => {
                  return v.tagCate === "标签2"
                })
            })
          }
        }
      })
    }, function (error) {
      console.log(error)
    })
  },
  // 素材标签1
  biaoChange1: function(e){
    this.setData({
      biaoData1:this.data.biao1[e.detail.value].name,
      biaoData1Id: this.data.biao1[e.detail.value].id
    })
  },

  // 素材标签2
  biaoChange2: function (e) {
    this.setData({
      biaoData2: this.data.biao2[e.detail.value].name,
      biaoData2Id: this.data.biao2[e.detail.value].id
    })
  },
  //选择单位事件处理函数
  tapItem: function (e) {
    let d = e.detail;
    this.setData({
      cid: d.itemid,
      oid: d.orgid
    })
  },
 
  // 时间日期
  bindtimeChange: function (e) {
    // let date = 'searchArry.startDate';
    // let endDate = 'searchArry.endDate';
    this.setData({
      startDate: e.detail.value,
      endDate: e.detail.value
    })
  },
  // 文体类型
  bindPickerChange: function (e) {
    let index = 'searchArry.docTypeId';
    this.setData({
      [index]: this.data.selectClass[e.detail.value].id,
      index: e.detail.value
    })
  },


  // 关键词
  breakTosearch: util.debounce(function (e) {
    // let inputValue = 'searchArry.keyword';
    this.setData({
      keyword: e.detail.value
    });
  },500),
 
})