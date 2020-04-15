// 查看事件文档https://developers.weixin.qq.com/miniprogram/dev/api/media/editor/EditorContext.html
const app = getApp();
Page({
  data: {
    formats: {},
    bottom: 0,
    readOnly: false,
    placeholder: '介绍一下你的详情吧，支持文字和图片...',
    _focus: false,
  },
  readOnlyChange() {
    this.setData({
      readOnly: !this.data.readOnly
    })
  },
  onLoad() {
    let that = this;
    
  },
  // 编辑器初始化完成时触发
  onEditorReady() {
    const that = this;
    wx.createSelectorQuery().select('#editor').context(function(res) {
      that.editorCtx = res.context;
      const eventChannel = that.getOpenerEventChannel()
      eventChannel.on('sendText', function (data) {
        that.editorCtx.setContents({
          html: data.data
        })
      })
    }).exec();
  },
  undo() {
    this.editorCtx.undo();
  },
  redo() {
    this.editorCtx.redo();
  },
  format(e) {
    let {
      name,
      value
    } = e.target.dataset;
    if (!name) return;
    // console.log('format', name, value)
    this.editorCtx.format(name, value);
  },
  // 通过 Context 方法改变编辑器内样式时触发，返回选区已设置的样式
  onStatusChange(e) {
    const formats = e.detail;
    this.setData({
      formats
    });
  },
  // 插入分割线
  insertDivider() {
    this.editorCtx.insertDivider({
      success: function() {
        console.log('insert divider success')
      }
    });
  },
  // 清除
  clear() {
    this.editorCtx.clear({
      success: function(res) {
        console.log("clear success")
      }
    });
  },
  // 移除样式
  removeFormat() {
    this.editorCtx.removeFormat();
  },
  // 插入当前日期
  insertDate() {
    const date = new Date()
    const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    this.editorCtx.insertText({
      text: formatDate
    });
  },
  // 插入图片
  insertImage() {
    wx.chooseImage({
      count: 1,
      success: (res) => {
        console.log(res.tempFilePaths[0])
        this.editorCtx.insertImage({
          src: res.tempFilePaths[0],
          width:'100%',
          data: {
            id: 'abcd',
            role: 'god'
          },
          success: () => {
            console.log('insert image success')
          }
        })
      }
    });
  },
  //选择图片
  chooseImage(e) {
    wx.chooseImage({
      sizeType: ['original', 'compressed'], //可选择原图或压缩后的图片
      sourceType: ['album', 'camera'], //可选择性开放访问相册、相机
      success: res => {
        const images = this.data.images.concat(res.tempFilePaths);
        debugger
        this.data.images = images.length <= 3 ? images : images.slice(0, 3);
      }
    })
  },
  // 直接保存
  saveText(){
    const sendText = this.getOpenerEventChannel();
    this.editorCtx.getContents({
      success: res =>{
        // 记录到全局
        app.globalData.html = res.html
        sendText.emit('getText', { data: res.html });
        wx.navigateBack({
          delta: 1,
          success: (res) => {
          }
        })
      }
    })
  },
  //查看详细页面
  toDeatil() {
    let that = this;
    this.editorCtx.getContents({
      success: (res) => {
        console.log(res.html)
        app.globalData.html = res.html
        wx.navigateTo({
          url: '../rich-details/details'
        })
      },
      fail: (res) => {
        console.log("fail：" , res);
      }
    });
  },
})