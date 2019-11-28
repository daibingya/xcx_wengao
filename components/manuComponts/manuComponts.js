var app = getApp();
var ip = app.globalData.ip;
Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    shareFlag: {
      type: Boolean,
      value: '',
    },
    types:{
      type:String,
      value:'',
    },
    timeFlag:{
      type:Boolean,
      value:''
    },
    checkFlag:{
      type: Boolean,
      value: ''
    },
    dataArray:{
      type:Array,
      value:''
    },
    checkAllFlag:{
      type:Boolean,
      value:''
    }
  },
  data: {
     elementObject:[],
     dataLength:0,
     resizeLength:0
  },
  observers: {
    // 控制全选列表
    "checkAllFlag":function(res){
        this.setData({
          checkAllSelt:res
        })
        if(res){
          let elementObjects=[];
          this.data.dataArray.forEach(function(val,index){
            if(val.remark){
              for(let i=0;i<val.remark.length;i++){
                elementObjects.push({
                  id:val.id,
                  sid:val.remark[i].id,
                  text:val.remark[i].content
                })
              }
            }
          })
          this.setData({
            elementObject: elementObjects,
            resizeLength:this.data.dataLength
          })
        }else{
          this.setData({
            elementObject:[],
            resizeLength:0
          })
        }
      this.triggerEvent('mySendData', this.data.elementObject);
    }
  },
  ready:function(){
    let dataLength=0;
    let that=this;
    let timeout=setTimeout(function(){
      that.data.dataArray.forEach((val, index) => {
        if (val.remark) {
          for (let i = 0; i < val.remark.length; i++) {
            dataLength++;
          }
        }
      })
      that.setData({
        dataLength: dataLength
      });
      timeout=null;
    },1000);
  },
  methods: {
    // 这里是获取文档;
    changeBox:function(e){
      let dataset=e.target.dataset;
      if(e.detail.value.length!=0){
        // 选中
        this.data.elementObject.push({
          id:dataset.id,
          sid:dataset.sid,
          text:dataset.text
        })
        ++this.data.resizeLength;
      }else{
        // 取消
        for(let i=0;i<this.data.elementObject.length;i++){
          if (this.data.elementObject[i].id == dataset.id && this.data.elementObject[i].sid==dataset.sid){
            this.data.elementObject.splice(i,1);
            break;
          }
        }
        --this.data.resizeLength;
      }
      if (this.data.resizeLength == this.data.dataLength){
          this.triggerEvent('myevent','checked')
      }else{
          this.triggerEvent('myevent', false)
      }
      this.triggerEvent('mySendData', this.data.elementObject);
    },
    //查看详情
    lookMessage:function(e){
      let that=this;
      // 生成文稿状态无法进入详情;
      if (this.data.checkFlag) {
        return
      }
      wx.showLoading({
        title: '加载中...',
      })
      new Promise((resolve, reject) => {
        wx.getStorage({
          key: 'token',
          success: function (res) {
            that.setData({
              token: res.data
            })
            resolve(res.data)
          },
          fail: function () { reject(error) }
        })
      }).then(token => {
        let id = e.currentTarget.dataset.sid;
        let types = this.properties.types;
        let url,src;
        // 首页的文稿库详情
        if(types=='library'){
            url = ip + '/api/document/detail/' + id;
            src = '/pages/manDetails/manDetails';  
        }else{
            // 我的文稿详情
            url = ip + '/api/mydocument/detail/' + id;
            src = '/pages/mymanDetails/mymanDetails';  
        }
        wx.request({
          url: url,
          method: 'GET',
          header: {
            "Authorization": "Bearer " + token
          },
          success: function (res) {
            if(res.data.code==200){
              wx.navigateTo({
                url: src,
                success:function(val){
                  // 通过eventChannel向被打开页面传送数据
                  val.eventChannel.emit('details', { data: res.data });
                  wx.hideLoading();
                }
              })
            }else{
              wx.showToast({
                title: '请求出错',
                image:'/image/err.png'
              })
            }
          }
        })
      }, error => { })
    },
    // 编辑删除
    operationChange:function(e){
      let that=this;
      let t = e.target.dataset.operation;
      let n = e.currentTarget.dataset;
      //编辑;
      if(t == "editor"){
        wx.navigateTo({
          url: '/pages/generation/generation',
          success: function (res) {
            res.eventChannel.emit('sendContent', { data: { name:n.title, array:[{text:n.text}],id:n.id} })
          }
        })
      }
      //删除
      if(t == "delete"){
        wx.showModal({
          title: '删除提示',
          content: '是否确定删除？',
          success:function(com){
            if(com.confirm){
              that.deleteData(n);
            }
          }
        })
      }
    },
    // 删除API请求
    deleteData:function(n){
      let that=this;
      new Promise((resolve, reject) => {
        wx.getStorage({
          key: 'token',
          success: function (res) {
            resolve(res.data)
          },
          fail: function () { reject(error) }
        })
      }).then(token => {
        wx.request({
          url: ip + '/api/mydocument/delete/' + n.id,
          method: "GET",
          header: {
            "Authorization": "Bearer " + token
          },
          success: function (res) {
            let pages = getCurrentPages();
            let types = that.properties.types;
            var prevPage = pages[pages.length - 1];
            if(res.data.code==200){
              if(types=="myMan"){
                prevPage.loadingData(false,false,false);
              }else if (types =="dm"){
                prevPage.data.manIndex=1;
                prevPage.manuScript(false,false,false);
              }
            };
          }
        })
      }, error => { })
    }
  }
})