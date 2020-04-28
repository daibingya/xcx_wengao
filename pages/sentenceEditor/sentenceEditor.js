// pages/manEntry/manEntry.js
var app = getApp();
var ip = app.globalData.ip;
const util = require('../debounce/debounce.js');
function Details(id, content) {
  this.id = id;
  this.content = content
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    attach: '',
    attachpath: '',
    treeData: {
      name: '请选择单位',
      id: 1,
      children: {}
    },
    rangesd: [{
      id: 0,
      name: "全员可见"
    }, {
      id: 1,
      name: "本单位可见"
    }],
    textCont: [],
    dataArray: [],
    uploadShowArray: []
  },
  pickerRangeChange: function (e) {
    this.setData({
      rangeData: this.data.rangesd[e.detail.value].name,
      rangeId: this.data.rangesd[e.detail.value].id
    })
  },
  // 新增摘要栏目
  addFun: function () {
    let textCont = this.data.textCont;
    textCont.push(new Details());
    this.setData({
      textCont: textCont
    })
  },
  // 删除
  reduceFun: function () {
    let textCont = this.data.textCont;
    textCont.pop();
    this.setData({
      textCont: textCont
    })
  },
  // 标题
  inputTitle: util.debounce(function (e) {
    this.setData({
      title: e.detail.value
    })
  }, 500),

  // 摘要
  changeInputText: util.debounce(function (e) {
    this.setData({
      contents:[e.detail.value]
    })
  }, 500),
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.convergence();
    that.getTime();
    that.data.textCont.length <= 0 && that.addFun();
    const eventChannel = this.getOpenerEventChannel();
    // 监听sendContent事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('sendContent', function (data) {
      wx.showLoading({
        title: '加载中...',
      })
      let id = data.data.id;
      that.getDetails(id);
    })
  },
  // 编辑系统内容数据
  getDetails: function (id) {
    let that = this;
    wx.request({
      url: ip + '/api/statement/detail/' + id,
      header: {
        "Authorization": "Bearer " + app.globalData.token,
      },
      method: "GET",
      success: function (data) {
        let dataMsg = data.data.data
        let tag1Name = dataMsg.tagName.split("，")[0]
        let tag2Name = dataMsg.tagName.split("，")[1]
        let tag1id = dataMsg.tag.split(",")[0]
        let tag2id = dataMsg.tag.split(",")[1]
        let companyData = {
          itemid: dataMsg.business,
          name: dataMsg.businessName
        }
        that.setData({
          getData: dataMsg,
          id: dataMsg.id,
          title: dataMsg.title,                // 标题   .      
          contents : dataMsg.content,           // 内容    .
          companyData: companyData,           // 业务归口
          fenLeiData: dataMsg.categoryName,   // 素材分类Name
          fenLeiId: dataMsg.categoryId,       // 素材分类ID
          tagData1: tag1Name, 
          tagData2: tag2Name,
          tagid1: tag1id,
          tagid2: tag2id,
          classData: dataMsg.typeName,         // 文体类型Name
          classId: dataMsg.typeId,             // 文体类型ID
          inputTime: dataMsg.pubTime,          // 发布时间
          rangeData: dataMsg.rangedName,       // 可见范围名称
          rangeId: dataMsg.ranged,             // 可见范围ID
          source: dataMsg.source,              // 语句来源
          sourcelink: dataMsg.urllink            // 来源链接
        })
        wx.hideLoading();
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },
  // 业务归口
  convergence: function () {
    let that = this;
    wx.request({
      url: ip + '/api/organization/business',
      header: {
        "Authorization": "Bearer " + app.globalData.token
      },
      method: "GET",
      success: function (res) {
        that.data.treeData.children = res.data.data;
        that.setData({
          treeData: that.data.treeData
        })
      }
    })
  },
  
  // 跳转选择单位界面
  selectCompany: function () {
    let that = this;
    wx.navigateTo({
      url: '../treePage/treePage',
      events: {
        // 获取被打开页面传送到当前页面的数据
        getcompany: function (data) {
          that.setData({
            companyData: data.data
          })
        }
      },
      success: function (res) {
        res.eventChannel.emit('sendTree', { data: that.data.treeData })
      }
    })
  },
  // 素材分类的 id
  pickerFenleiChange: function (val) {
    let that = this;
    this.setData({
      fenLeiData: this.data.Fenlei[val.detail.value].name,
      fenLeiId: this.data.Fenlei[val.detail.value].id
    })
  },
  // 获取素材标签数据
  getTagdata: function () {
    let that = this;
    wx.request({
      url: ip + '/api/statementcategory/tag',
      method: 'GET',
      header: {
        "Authorization": "Bearer " + app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 200) {
          that.setData({
            tag1: res.data.data.filter(function (value) {
              return value.tagCate == "标签1"
            }),
            tag2: res.data.data.filter(function (value) {
              return value.tagCate == "标签2"
            })
          })
        }
      }
    })
  },
  // 素材标签1
  pickerTagChange1: function (e) {
    this.setData({
      tagData1: this.data.tag1[e.detail.value].name,
      tagid1: this.data.tag1[e.detail.value].id
    })
  },
  // 素材标签2
  pickerTagChange2: function (e) {
    this.setData({
      tagData2: this.data.tag2[e.detail.value].name,
      tagid2: this.data.tag2[e.detail.value].id
    })
  },

  // 级别
  pickerlevelChange: function (e) {
    this.setData({
      levelData: this.data.level[e.detail.value].name,
      levelId: this.data.level[e.detail.value].id
    })
  },
  
  // 类型
  pickerTypeChange: function (e) {
    this.setData({
      classData: this.data.clAss[e.detail.value].name,
      classId: this.data.clAss[e.detail.value].id
    })
  },

  // 发布时间
  pickerTimeChange: function (e) {
    this.setData({
      inputTime: e.detail.value
    })
  },
  // 获取时间
  getTime: function () {
    // 时间设定
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    // 获取年份  
    var Y = date.getFullYear();
    // 获取月份  
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    // 获取当日日期 
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    this.setData({
      inputTime: Y + '-' + M + '-' + D
    })
    console.log("inputTime:"+this.data.inputTime)
  },
  // 来源
  sourceChange: util.debounce(function (e) {
    this.setData({
      source: e.detail.value
    })
  }, 500),

  // 来源链接
  sourceChangelink: util.debounce(function (e) {
    this.setData({
      sourcelink: e.detail.value
    })
  }, 500),
  // 正文改变：
  onStatusChange: util.debounce(function (e) {
    this.setData({
      edtiorContext: e.detail.text
    })
  }),
  // 保存到草稿箱
  Savecaogao: function () {
    this.sendManuscript(false, 1);
  },
  // 提交数据
  sendManuscript: function (e, status = 0) {
    let data = this.data;
    let that = this;
    if (!data.classId && !data.levelId && !data.rangeId) {
      wx.showModal({
        title: '参数错误',
        content: '请选择必填字段',
      })
      return false
    }
    wx.request({
      url: ip + '/api/statement/batchSave',
      header: {
        "Authorization": "Bearer " + app.globalData.token
      },
      method: "POST",
      data: {
        "id": data.id ? data.id : null,
        "title": data.title ? data.title : '',
        "contents": data.contents ? data.contents : [],
        "type": data.classId ? data.classId : '',
        "status": status ? status : 0, //0发布  1草稿
        "pubTime": data.inputTime ? data.inputTime : '',
        "source": data.source ? data.source : '',
        "urllink": data.sourcelink ? data.sourcelink : '',
        "ranged": data.rangeId ? data.rangeId : 0,
        "business": data.companyData ? data.companyData.itemid : '',
        "categoryid": data.fenLeiId ? data.fenLeiId : '',
        "tag": [data.tagid1 , data.tagid2]
      },
      success: function (res) {
        if (res.data.code == 200) {
          wx.showToast({
            title: '提交成功',
            success: function () {
              const eve = that.getOpenerEventChannel()
              eve.emit('postPrames');
              eve.emit('pullChang');
              wx.navigateBack()
            }
          })
        } else {
          wx.showModal({
            title: '提交错误',
            content: res.data.msg
          })
        }
      },
      fail: err => {
        wx.showModal({
          title: "网络错误",
          content: err.data.msg
        })
      }
    })
  },

  // 素材分类数据获取
  getClassification: function () {
    let that = this;
    wx.request({
      url: ip + '/api/statementcategory/getCateByUser',
      header: {
        "Authorization": "Bearer " + app.globalData.token
      },
      method: 'GET',
      success: function (res) {
        if (res.data.code == 200) {
          that.setData({
            Fenlei: res.data.data
          })
        }
      }
    })
  },

  // 获取文体类型数据
  getLiteraryStyle: function () {
    let that = this;
    wx.request({
      url: ip + '/api/statement/type',
      header: {
        "Authorization": "Bearer " + app.globalData.token
      },
      success: function (res) {
        console.log(res)
        if (res.data.code == 200) {
          that.setData({
            clAss: res.data.data
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
  */
  onReady: function () {
    let that = this;
    that.getClassification();
    that.getLiteraryStyle();
    that.getTagdata();
  }
})