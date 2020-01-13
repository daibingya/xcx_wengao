// pages/myDraft/myDraft.js
var app=getApp();
var ip=app.globalData.ip;
Page({
  data: {
      textActive:true,
      node:'',
      manIndex:1,
      sentenceIndex:1
  },
  goMessages: function (e) {
    let that = this;
    if (e.target.dataset.id) {
      wx.showLoading({
        title: '加载中...',
      })
      wx.request({
        url: ip + '/api/statement/detail/' + e.target.dataset.id,
        header: {
          "Authorization": "Bearer " + that.data.token
        },
        method: 'GET',
        success: function (value) {
          wx.navigateTo({
            url: '/pages/details/details',
            success: function (res) {
              res.eventChannel.emit('sendSentence', { data: value.data.data })
              wx.hideLoading();
            }
          })
        }
      })
    }
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
          res.eventChannel.emit('changyong', { data: {
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
  // TAB切换
  activeBox:function(e){
    if (this.data.node != e.target.dataset.id){
        if (e.target.dataset.id == "wengao"){
          let url = '/api/document/mydraft';
          this.setData({ textActive: 'wengao', manIndex: 1, url: url })
          this.manuScript(false,false,false,url);
        };
      if (e.target.dataset.id == "generate"){
          let url = '/api/mydocument/mydraft';
          this.setData({ textActive: 'generate', manIndex: 1, url: url })
          this.manuScript(false, false, false, url);
        };
        if (e.target.dataset.id == "yuju") {
          this.setData({ textActive: 'yuju', sentenceIndex: 1 })
          this.sentEnce(false, false, false)
      };
    }
    this.setData({
      node: e.target.dataset.id
    })
  },
  // 加载常用语句
  sentEnce:function(down,up,searchData){
      let that=this;
      wx.showLoading({
        title: '加载中...',
      });
      up && ++that.data.sentenceIndex
      wx.request({
        url: ip+'/api/statement/mydraft',
        method:"POST",
        header:{
          "Authorization": "Bearer "+that.data.token
        },
        data:{
          "size": 20,
          "current":that.data.sentenceIndex,
          "searchCondition": {
            "orgId":"",
            "startDate": "",
            "endDate": "",
            "keyword": "" //关键字查询
          }
        },
        success:function(res){
          wx.hideLoading();
          if(res.data.code==200){
            that.setData({
              sentenceData:up ? that.data.sentenceData.concat(...res.data.data.records):res.data.data.records
            })
            if (down) {
              wx.stopPullDownRefresh({
                success: function () {
                  wx.showToast({
                    title: '刷新成功',
                  })
                  wx.hideNavigationBarLoading();
                }
              })
            }
            if (up && res.data.data.records.length <= 0) {
              wx.showToast({
                title: '我是有底线的',
                image: "/image/nofined.png"
              })
            }
          }else{
            wx.showModal({
              title: '请求错误',
              content: res.data.msg,
              success:function(res){
                wx.reLaunch({
                  url: '/login/index'
                })
              }
            })
          };
        }
      })
  },
  // 加载录入文稿/生成文稿
  manuScript:function(down,up,searchData,url){
    let that=this;
    wx.showLoading({
      title: '正在加载...',
    })
    up && ++that.data.manIndex
    new Promise((resolve, reject) => {
      wx.getStorage({
        key: 'token',
        success: function (res) {
          that.setData({
            token: res.data
          });
          resolve(res.data);
        },
      })
    }).then(token => {
      wx.request({
        url: ip + url,
        method: "POST",
        header: {
          "Authorization": "Bearer " + token
        },
        data: {
          "current": that.data.manIndex,
          "size": 10
        },
        success: function (res) {
          wx.hideLoading();
          if (res.data.code == 200) {
            console.log(url.indexOf('i'))
            that.setData({
              mydocumentData: up ? that.data.mydocumentData.concat(res.data.data.records) : res.data.data.records,
            });
            if (down) {
              wx.stopPullDownRefresh({
                success: function () {
                  wx.showToast({
                    title: '刷新成功',
                  })
                  wx.hideNavigationBarLoading();
                }
              })
            }
          }else{
            wx.showModal({
              title: '请求错误',
              content: res.data.msg,
            })
          };
          if (up && res.data.data.records.length <= 0) {
            wx.showToast({
              title: '我是有底线的',
              image: "/image/nofined.png"
            })
          }
        }
      })
    }, error => {
      wx.showModal({
        title: '请求错误',
        content: error.errMsg,
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.manuScript(false,false,false);
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let url=this.data.url;
    if (this.data.textActive == 'wengao' || this.data.textActive == 'generate'){
      // 加载录入文稿
      this.data.manIndex=1;
      this.manuScript(true,false,false , url)
    } 
    else if (this.data.textActive == 'yuju'){
      // 加载常用语句
      this.data.sentenceIndex=1;
      this.sentEnce(true,false,false)
    }
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 草稿->文稿
    console.log("entry")
    if (this.data.textActive == 'wengao' || this.data.textActive == 'generate'){
        let url=this.data.url;
        console.log('render')
        this.manuScript(false,true,false,url);
    }else{
    // 草稿->常用语句
      this.sentEnce(false,true,false)
    };
  }
})