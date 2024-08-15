// pages/main/main.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user:[],
    recentAnalysisList:[],
    templateList:[]
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
        //加载最近分析记录
        console.log(this.data.user)
        wx.request({
          url: 'http://192.168.50.32:10010/goodan-homepage/get_RecentAnalysisRecords',
          data:{
            pageNum:1
          },
          method: 'GET',
          header: {
            'Authorization':this.data.user.shortToken,
            'Gateway':'GoodAn',
            'content-type': 'application/json' // 默认值
          },
          success: (res) =>{
            console.log(res.data.data.records)
            for(let i=0;i<res.data.data.records.length;i++){
              res.data.data.records[i].detectedTime=res.data.data.records[i].detectedTime.replace('T', ' ')
              if(i>3){
                res.data.data.records.splice(i, 1);
                i--
                continue
              }
              console.log(res.data.data.records[i].secureScore)
              if(res.data.data.records[i].secureScore<25){
                res.data.data.records[i].color='linear-gradient(to right,#FFD4BD,#D6573E)'
                res.data.data.records[i].colorCircle='#D6573E'
              }
              else if(res.data.data.records[i].secureScore<50){
                res.data.data.records[i].color='linear-gradient(to right,#F2DCAA,#e7823c)'
                res.data.data.records[i].colorCircle='#e7823c'
              }
              else if(res.data.data.records[i].secureScore<75){
                res.data.data.records[i].color='linear-gradient(to right,#BDF1FF,#1B79D1)'
                res.data.data.records[i].colorCircle='#1B79D1'
              }
              else if(res.data.data.records[i].secureScore<=100){
                res.data.data.records[i].color='linear-gradient(to right,#DDFA9D,#9BD420)'
                res.data.data.records[i].colorCircle='#9BD420'
              }
            }
            console.log(res.data.data.records)
            this.setData({
              recentAnalysisList:res.data.data.records
            })
          }
        })
        //加载范本库
        wx.request({
          url: 'http://192.168.50.32:10010/goodan-homepage/get_EssayInfo',
          data:{
            pageNum:1
          },
          method: 'GET',
          header: {
            'Authorization':this.data.user.shortToken,
            'Gateway':'GoodAn',
            'content-type': 'application/json' // 默认值
          },
          success: (res) =>{
            console.log(res.data.data.records)
            for(let i=0;i<res.data.data.records.length;i++){
              if(i==0){
                res.data.data.records[i].label1='恶意检测'
              }else if(i==1){
                res.data.data.records[i].label1='可视化'
                res.data.data.records[i].label2='研究'
              }else if(i==2){
                res.data.data.records[i].label1='违法犯罪'
                res.data.data.records[i].label2='分类模型'
              }else if(i==3){
                res.data.data.records[i].label1='分类模型'
              }else{
                res.data.data.records.splice(i,1)
                i--
              }
            }
            this.setData({
              templateList:res.data.data.records
            })
            console.log(this.data.templateList)
          }
        })
      }
    })
  },
  //点击更多最近
  recentMoreClick(){
    wx.reLaunch({
      url: '/pages/analysisPage/analysisPage',
    })
  },
  //点击更多范本
  templateMoreClick(){
    wx.navigateTo({
      url: '/pages/moreTemplate/moreTemplate'
    })
  },
  //点击分析记录
  recentClick: function(event){
    const fileMd5 = event.currentTarget.dataset.filemd5
    console.log(fileMd5)
    wx.navigateTo({
      url: '/pages/recentDetail/recentDetail'
    })
    wx.setStorage({
      key:"recentMd5",
      data:fileMd5
    })
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