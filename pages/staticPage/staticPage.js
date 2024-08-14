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
    total:0,//总分片数
    isUpload:0,//进度条状态
    cProgress:0,//上传百分比
    chunkNumber:0//上传的分片数
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
  //点击静态分析
  startAnalysisClick(){
    const file=this.data.chooseFile
    if(this.data.chooseFile == null||this.data.chooseFileName == '') {
      wx.showToast({
        title: '请先上传文件',
        icon: 'none'
      });
      return;
    }
    console.log(file)
    // 计算MD5和分片总数
    this.calculateMD5(file.path, file.size).then(md5 => {
      this.setData({
        md5Hash: md5
      });
      // 进行分片上传
      this.uploadFileInChunks(file.path, file.size, md5);
    });
    //开始静态分析
    console.log('开始静态分析')
    wx.request({
      url: 'http://192.168.50.32:10010/apk-info/checkFile',
      data:{
        md5:this.data.md5Hash
      },
      method: 'POST',
      header: {
        'Authorization':this.data.user.shortToken,
        'Gateway':'GoodAn',
        'content-type': 'application/json' // 默认值
      },
      success: (res) =>{
        console.log(res.data.data)
      }
    })
  },
  calculateMD5(filePath, fileSize) {
    return new Promise((resolve, reject) => {
      const chunkSize = 1024*1024;
      const fileReader = wx.getFileSystemManager();
      let currentChunk = 0;
      const totalChunks = Math.ceil(fileSize / chunkSize);
      const spark = new SparkMD5.ArrayBuffer();
      const loadNextChunk = () => {
        const start = currentChunk * chunkSize;
        const end = Math.min(fileSize, start + chunkSize);
        fileReader.readFile({
          filePath,
          position: start,
          length: end - start,
          success: (res) => {
            spark.append(res.data);
            currentChunk++;
            if (currentChunk < totalChunks) {
              loadNextChunk();
            } else {
              const md5 = spark.end();
              resolve(md5);
            }
          },
          fail: (err) => {
            reject(err);
          }
        });
      };
      loadNextChunk();
    });
  },
  uploadFileInChunks(filePath, fileSize, md5Hash) {
    const chunkSize = 1024*1024;
    const totalChunks = Math.ceil(fileSize / chunkSize);
    const fileReader = wx.getFileSystemManager();
    //显示上传进度条
    this.setData({
      total:totalChunks,
      isUpload:1
    })
    const uploadChunk = (chunkNumber) => {
      const start = chunkNumber * chunkSize;
      const end = Math.min(fileSize, start + chunkSize);
      fileReader.readFile({
        filePath,
        position: start,
        length: end - start,
        success: (res) => {
          wx.uploadFile({
            url: 'http://192.168.50.32:10010/apk-info/uploadBig',
            filePath: filePath,
            name: 'file',
            formData: {
              chunkNumber: chunkNumber.toString(),
              totalNumber: totalChunks.toString(),
              md5: md5Hash
            },
            method: 'GET',
            header: {
              'Authorization':this.data.user.shortToken,
              'Gateway':'GoodAn',
              'content-type': 'application/json' // 默认值
            },
            success: (uploadRes) => {
              console.log(`分片 ${chunkNumber} 上传成功`, uploadRes);
              console.log(chunkNumber/this.data.total*100)
              this.setData({
                cProgress:chunkNumber/this.data.total*100,
                cNumber:chunkNumber
              })
              if (chunkNumber + 1 < totalChunks) {
                uploadChunk(chunkNumber + 1);
              } else {
                this.setData({
                  cProgress:100,
                  cNumber:this.data.total
                })
                wx.showToast({
                  title: '上传成功',
                  icon: 'success'
                });
              }
            },
            fail: (err) => {
              console.error(`分片 ${chunkNumber} 上传失败`, err);
              wx.showToast({
                title: `分片 ${chunkNumber} 上传失败`,
                icon: 'none'
              });
            }
          });
        },
        fail: (err) => {
          console.error(`读取分片 ${chunkNumber} 失败`, err);
        }
      });
    };
    uploadChunk(0); // 从第一个分片开始上传
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