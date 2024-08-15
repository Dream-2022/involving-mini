// pages/analysisPage/analysisPage.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    recentAnalysisList:[]
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
      }
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