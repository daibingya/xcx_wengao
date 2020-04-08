// pages/manEntry/manEntry.js
var app = getApp();
var ip = app.globalData.ip;
const util = require('../debounce/debounce.js');
function Details(id,content){
  this.id=id;
  this.content=content
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    attach:'',
    attachpath:'',
    treeData: {
      name: '请选择单位',
      id: 1,
      children: {}
    },
    tagFlag:true,
    rangesd:[{
      id:0,
      name:"全员可见"
    },{
      id:1,
      name:"本单位可见"
    }],
    textCont:[],
    dataArray:[],
    uploadShowArray:[]
  },
  pickerRangeChange:function(e){
    this.setData({
      rangeData: this.data.rangesd[e.detail.value].name,
      rangeId: this.data.rangesd[e.detail.value].id
    })
  },
  // 新增摘要栏目
  addFun:function(){
    let textCont=this.data.textCont;
    textCont.push(new Details());
    this.setData({
      textCont:textCont
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
  inputTitle:util.debounce(function(e){
    this.setData({
      title:e.detail.value
    })
  },500),
  // 摘要
  changeInputText:util.debounce(function(e){
    //获取唯一标示index
    let index = e.currentTarget.dataset.sid; //第index
    let contContent=this.data.textCont[index];
    //给对应index的对象赋值
    contContent.content=e.detail.value;
    contContent.id = index;
    //如果无内容，将从数组中删除
    if (!e.detail.value.trim()){
      this.data.textCont.length != 1 && this.data.textCont.splice(index, 1);
    }
    //重新设置内容
    this.setData({
        textCont:this.data.textCont
    })

  },500),
  // 文稿附件
  focusSend:function(){
    let that=this;
    wx.chooseMessageFile({
      type: 'all',
      count: 5,
      success(res){
        wx.showLoading({
          title: '上传中，请等待...',
        })
        let tempFiles=res.tempFiles;
        // 此处size单位是b     50兆为52428800b
        if (tempFiles.size >= 52428800){
            wx.showModal({
              title: '上传出错',
              content: '文件不得大于50兆',
            })
          return false
        }
        let caniuse= wx.canIUse("uploadFile");
        if(!caniuse){
          console.log("客户端不支持上传")
          wx.showModal({
            title: '错误提示',
            content: '您的微信版本不支持上传文件！',
          })
          return false
        }
        for (let i = 0; i < tempFiles.length;i++){
          that.uploadFiles(tempFiles[i].path,tempFiles[i].name);
        }
      }
    }) 
  },
  // 上传功能
  uploadFiles:function(path,name){
    let that=this;
    const uploadTask = wx.uploadFile({
      url: ip + "/api/document/uploadFile",
      filePath: path,
      name: "file",
      formData: {
        method: 'POST'   //请求方式
      },
      header: {
        "Authorization": "Bearer " + that.data.token,
        "Content-Type": "multipart/form-data"
      },
      success: function (data) {
        wx.hideLoading();
        let datas = JSON.parse(data.data);
        // that.setData({ name: name })
        if (datas.code !== 200) {
          wx.showModal({
            title: '上传错误',
            content: datas.msg,
          })
        } else {
          wx.showToast({
            title: '成功',
          })
          that.data.uploadShowArray.push({
            name:name,
            id:datas.data.fileid
          });
          that.setData({
            uploadShowArray:that.data.uploadShowArray
          })
        }
      },
      fail: function (error) {
        wx.hideLoading();
        let datas = JSON.parse(error.data);
        wx.showModal({
          title: '上传错误',
          content: datas.msg,
        })
      },
      complete: function () {
        console.log("接口调用结束...")
      }
    })
  },
  // 删除附件
  reduceUpload:function(e){
    var that=this;
    let id=e.currentTarget.dataset.id;
    wx.request({
      url: ip+'/api/document/deleteFile?fileid='+id,
      header:{
        "Authorization": "Bearer " + this.data.token,
      },
      method:"GET",
      success:function(res){
        if(res.data.code==200){
          for (let i = 0; i < that.data.uploadShowArray.length; i++) {
            if (that.data.uploadShowArray[i].id == id) {
              that.data.uploadShowArray.splice(i, 1);
              that.setData({
                uploadShowArray: that.data.uploadShowArray
              })
            }
          }
        }
      },
      fail:function(error){
        console.log(error)
      }
    })
  },
  // 获取焦点
  focusEdit:function(){
    wx.navigateTo({
      url:"../rich-index/index"
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    that.convergence();
    that.data.textCont.length <= 0 && that.addFun();
    const eventChannel = this.getOpenerEventChannel();
    // 监听sendContent事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('sendContent', function (data) {
        wx.showLoading({
          title: '加载中....',
        })
        let id = data.data.id;
        new Promise((resolve,reject)=>{
          wx.getStorage({
            key: 'token',
            success: function(res) {
              resolve(res.data)
            },
          })
        }).then(function(token){
          wx.request({
            url: ip + '/api/document/detail/' + id,
            header: {
              "Authorization": "Bearer " +token,
            },
            method: "GET",
            success:function(data){
              let dataMsg=data.data.data
              let companyData={
                itemid:dataMsg.business,
                name: dataMsg.businessName
              }
              that.setData({
                id : dataMsg.id,
                getData: dataMsg,
                title:dataMsg.title,                // 标题         
                textCont: dataMsg.remark,           // 摘要
                companyData: companyData,           // 业务归口
                fenLeiData: dataMsg.categoryName,   // 素材分类Name
                fenLeiId: dataMsg.categoryId,       // 素材分类ID
                tagData:dataMsg.tagName,            // 素材标签Name
                tagId: dataMsg.tag,                 // 素材标签ID
                levelData: dataMsg.levelName,       // 级别Name
                levelId: dataMsg.levelId,           // 级别ID
                classData:dataMsg.typeName,         // 类别Name
                classId:dataMsg.typeId,             // 类别ID
                inputTime:dataMsg.pubTime,          // 发布时间
                rangeData: dataMsg.rangedName,      // 范围名称
                rangeId:dataMsg.ranged,             // 范围ID
                source: dataMsg.source,             // 文稿出处
                uploadShowArray:dataMsg.attachList?dataMsg:[], // 附件信息
                edtiorContext:dataMsg.content       // 正文
              })
              wx.hideLoading();
              that.getTagdata(dataMsg.categoryId)
            },
            fail:function(err){
              console.log(err)
            }
          })
        })

      
      })
  },
  // 业务归口
  convergence: function () {
    let that = this;
    wx.request({
      url: ip + '/api/organization/business',
      header: {
        "Authorization": "Bearer " + that.data.token
      },
      method: "GET",
      success: function (res) {
        console.log(res)
        that.data.treeData.children = res.data.data;
        that.setData({
          treeData: that.data.treeData
        })
      }
    })
  },
  // 跳转选择单位界面
  selectCompany:function(){
    console.log('entry')
    let that = this;
    wx.navigateTo({
      url: '../treePage/treePage',
      events: {
        // 获取被打开页面传送到当前页面的数据
        getcompany: function (data) {
          that.setData({
            companyData:data.data
          })
        }
      },
      success:function(res){
        res.eventChannel.emit('sendTree', { data: that.data.treeData })
      }
    })
  },
  // 选择业务归口的id
  // tapItem:function(val){
  //   this.setData({businessId:val.detail.itemid})
  // },
  // 素材分类的 id
  pickerFenleiChange:function(val){
    let that=this;
    this.setData({
      fenLeiData:this.data.Fenlei[val.detail.value].title,
      fenLeiId: this.data.Fenlei[val.detail.value].id
    })
    let id = this.data.Fenlei[val.detail.value].id
    this.getTagdata(id);
  },
  // 素材标签数据
  getTagdata:function(id){
    let that=this;
    wx.request({
      url: ip + '/api/category/getTagByCategoryId?categoryId=' + id,
      method: 'GET',
      header: {
        "Authorization": "Bearer " + that.data.token
      },
      success: function (res) {
        if (res.data.code == 200) {
          let flag;
          if (!res.data.data || !res.data.data.length) {
            flag = true
          } else {
            flag = false
          }
          that.setData({
            tag: res.data.data,
            tagFlag: flag
          })
        }
      }
    })
  },
  // 素材标签
  pickerTagChange:function(val){
    this.setData({
      tagData:this.data.tag[val.detail.value].name,
      tagId: this.data.tag[val.detail.value].id
    })
  },
  onEditorReady:function() {
    const that = this;
    let time = setTimeout(function(){
      wx.createSelectorQuery().select('#editor').context(function (res) {
        that.editorCtx = res.context;
        that.data.getData && that.editorCtx.setContents({
          html: that.data.getData.content,
          success: (res) => {
            console.log(res)
          },
          fail: (res) => {
            console.log(res)
          }
        })
      }).exec()
      clearTimeout(time);
    }, 1000) 
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
  sourceChange:util.debounce(function(e){
    this.setData({
      source:e.detail.value
    })
  },500),
  // 正文
  editorInput:util.debounce(function(e){
    this.setData({
      edtiorContext:e.detail.text
    })
  },500),
  // 正文改变：
  onStatusChange: util.debounce(function(e){
    this.setData({
      edtiorContext: e.detail.text
    })
  }),
  // 保存到草稿箱
  Savecaogao:function(){
    this.sendManuscript(false,1);
  },
  // 提交
  sendManuscript:function(e,status=0){
    let data=this.data;
    let that=this;
    // 拼接上传的文件名，id
    if (data.uploadShowArray && data.uploadShowArray.length){
        let symbols;
        for(let i=0;i<data.uploadShowArray.length;i++){
          i == data.uploadShowArray.length - 1 ? symbols='':symbols=':'
          data.attach += data.uploadShowArray[i].name + symbols;
          data.attachpath += data.uploadShowArray[i].id + symbols;
        }
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
        "id":data.id ? data.id:'',
        "title": data.title ? data.title:'',
        "content": data.edtiorContext ? data.edtiorContext:'',
        "typeId": data.classId ? data.classId:'',
        "levelId": data.levelId ? data.levelId:'',
        "remark": data.textCont ? data.textCont:'',
        "status": status?status:0, //0发布  1草稿
        "pubTime": data.inputTime ? data.inputTime:'',
        "memo": null,
        "source": data.source ? data.source:'',
        "urllink": "",
        "ranged": data.rangeId ? data.rangeId:0,
        "attach": data.attach ? data.attach:'',
        "attachpath": data.attachpath ? data.attachpath:'',
        "business": data.companyData ? data.companyData.itemid:'',
        "categoryId": data.fenLeiId ? data.fenLeiId :'',
        "tag": data.tagId ? data.tagId:''
      },
      success:function(res){
        if(res.data.code==200){
          wx.showToast({
            title: '提交成功',
            success:function(){
              var pages = getCurrentPages(); // 获取页面栈
              var prevPage = pages[pages.length - 2]; // 上一个页面
              prevPage.data.manIndex = 1;
              prevPage.manuScript && prevPage.manuScript(false, false, false,'/api/document/mydraft')
              prevPage.loadingData && prevPage.loadingData(false, false, false, prevPage.data.url);
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
    // 素材标签;
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
      // 素材分类
      wx.request({
        url: ip + '/api/category/getCateByUser',
        header: {
          "Authorization": "Bearer " + token
        },
        method:'GET',
        success: function (res) {
          if (res.data.code == 200) {
            that.setData({
              Fenlei : res.data.data
            })
          }
        }
      })
    }, fails => { })
  }
})