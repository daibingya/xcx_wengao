var app = getApp();
var ip = app.globalData.ip;
Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    shareFlag: {
      type: Boolean,
      value: '',
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
          this.data.dataArray[0].forEach(function(val,index){
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
        wx.request({
          url: ip + '/api/document/detail/' + id,
          method: 'GET',
          header: {
            "Authorization": "Bearer " + token
          },
          success: function (res) {
            console.log(res);
            wx.navigateTo({
              url: '/pages/manDetails/manDetails',
              success:function(val){
                // 通过eventChannel向被打开页面传送数据
                val.eventChannel.emit('acceptDataFromOpenerPage', { data: res.data })
              }
            })
          }
        })
      }, error => { })
      
    }
  }
})