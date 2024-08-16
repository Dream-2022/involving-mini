// pages/myPage/myPage.js
const SparkMD5 = require('./spark-md5.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    user:[],
    activeTab: 0,
    tabs: [
      { label: '文件'},
      { label: 'URL'},
      { label: 'MD5'},
    ],
    chooseFile:null,
    chooseFileName:'',
    md5Hash:'',
    isUpload:0,//进度条状态
    cProgress:0,//上传百分比
    chunkNumber:0,//上传的分片数
    isDisabled:false//按钮是否不可点击
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.getStorage({
      key: "userInfo",
      success:(res)=> {
        this.setData({
          user: JSON.parse(res.data)
        })
      }
    })
    const tab = options.tab ? parseInt(options.tab) : 0;
    this.setData({
      activeTab: tab
    });
    // let websocket = new WebSocket("ws://192.168.50.32:10010/apk-info/websocket/" + this.data.userMail + "?k=v");
    setTimeout(()=>{
      this.connectWebSocket()
    },0)
  },
  connectWebSocket() {
    // 连接 WebSocket
    console.log(this.data.user.userMail)
    wx.connectSocket({
      url: "ws://192.168.50.32:10010/apk-info/websocket/" + this.data.user.userMail + "?k=v", 
      header: {
        'content-type': 'application/json',
      },
      success: (res) => {
        console.log('WebSocket 连接成功');
      },
      fail: (err) => {
        console.error('WebSocket 连接失败', err);
      }
    });
    wx.onSocketOpen((res) => {
      console.log('WebSocket 已打开');
      this.setData({
        socketOpen: true,
        socketMessageQueue: []
      });
      // 在连接打开后绑定消息监听器
      wx.onSocketMessage((message) => {
        console.log('收到服务器消息:', message.data);
        if (!isNaN(parseInt(message.data))) {
            this.setData({
              cProgress:message.data
            })
            if (message.data == 100) {
                setTimeout(() => {
                    this.setData({
                      isUpload:0
                    })
                })
            }
        }
      });
    });
    // 监听 WebSocket 错误事件
    wx.onSocketError((err) => {
      console.error('WebSocket 错误:', err);
    });
    // 监听 WebSocket 关闭事件
    wx.onSocketClose(() => {
      console.log('WebSocket 已关闭');
      this.setData({
        socketOpen: false
      });
    });
  },
  fileUploadClick() {
    if (this.data.chooseFile != null || this.data.chooseFileName != '') {
      wx.showToast({
        title: '不可同时上传多个文件',
        icon: 'none'
      });
      return;
    }
    wx.chooseMessageFile({
      count: 1, // 选择的文件数量
      type: 'file', // 文件类型
      success: (res) => {
        const tempFilePaths = res.tempFiles;
        if (!tempFilePaths[0].name.endsWith('.apk')) {
          wx.showToast({
            title: '请选择 APK 文件',
            icon: 'none'
          });
          return;
        }
        wx.showToast({
          title: '选择成功',
          icon: 'success'
        });
        this.setData({
          chooseFile: tempFilePaths[0],
          chooseFileName: tempFilePaths[0].name
        });
      },
      fail: (err) => {
        console.error('文件选择失败:', err);
      }
    });
  },  
  // 点击静态分析
  startAnalysisClick() {
    const file = this.data.chooseFile;
    if (file==null || this.data.chooseFileName=='') {
      wx.showToast({
        title: '请先上传文件',
        icon: 'none'
      });
      return;
    }
    if (this.data.isDisabled) {
      console.log('按钮已禁用');
      return; // 如果按钮不可点击，直接返回
    }
    this.setData({
      isDisabled:true,
      chooseFile:null,
      chooseFileName:''
    })
    console.log(file);
    // 计算MD5和分片总数
    this.calculateMD5(file.path, file.size).then(md5 => {
      console.log(md5)
      this.setData({
        md5Hash: md5
      });
      // 进行分片上传并在上传完成后开始静态分析
      this.uploadFileInChunks(file.path, file.size, md5, () => {
        console.log('开始静态分析');
        this.setData({
          isUpload:1
        })
        wx.request({
          url: 'http://192.168.50.32:10010/apk-info/checkFile',
          data: {
            md5
          },
          timeout: 480000,//8min
          method: 'GET',
          header: {
            'Authorization': this.data.user.shortToken,
            'Gateway': 'GoodAn',
            'content-type': 'application/json' // 默认值
          },
          success: (res) => {
            console.log(res.data.data);
            wx.setStorage({
              key: "staticList",
              data: JSON.stringify(res.data.data),
              success: () => {
                wx.navigateTo({
                  url: '/pages/staticResult/staticResult'
                });
              }
            })
          },
          fail: (err) => {
            console.error('静态分析请求失败:', err);
          }
        });
      });
    });
  },
  uploadFileInChunks(filePath, fileSize, md5Hash, callback) {
    const fileReader = wx.getFileSystemManager();
    fileReader.readFile({
      filePath,
      success: (res) => {
        console.log(md5Hash)
        wx.uploadFile({
          url: 'http://192.168.50.32:10010/apk-info/uploadBig',
          filePath: filePath,
          name: 'file',
          formData: {
            chunkNumber: 0,
            totalNumber: 1,
            md5: md5Hash
          },
          method: 'GET',
          header: {
            'Authorization': this.data.user.shortToken,
            'Gateway': 'GoodAn',
            'content-type': 'application/json'
          },
          success: (uploadRes) => {
            console.log(`分片 ${this.data.chunkNumber} 上传成功`, uploadRes);
            wx.showToast({
              title: "上传成功", 
              icon: "success",
              image: "", 
              duration: 1500, 
              mask: false, 
            })
            callback()
          }
        });
      }
    });
  },
  // 计算MD5
  calculateMD5(filePath, fileSize) {
    return new Promise((resolve, reject) => {
      const fileReader = wx.getFileSystemManager();
      const spark = new SparkMD5.ArrayBuffer();

      const loadNextChunk = () => {
        fileReader.readFile({
          filePath,
          success: (res) => {
            spark.append(res.data);
            const md5 = spark.end();
            resolve(md5);
          },
          fail: (err) => {
            reject(err);
          }
        });
      };

      loadNextChunk();
    });
  },
  //点击删除文件
  deleteFileClick(){
    this.setData({
      chooseFile:null,
      chooseFileName:''
    })
  },
  // 切换选项卡
  changeTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      activeTab: index
    });
  },
  titleClick(){

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    wx.onSocketClose(() => {
      console.log('WebSocket 已关闭');
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})