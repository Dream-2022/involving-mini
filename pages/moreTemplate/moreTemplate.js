// pages/myPage/myPage.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
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
              }else if(i==4){
                res.data.data.records[i].label1='研究'
              }else if(i==5){
                res.data.data.records[i].label1='分析方法'
              }else if(i==6){
                res.data.data.records[i].label1='方法研究'
                res.data.data.records[i].label2='风险度量'
              }else if(i==7){
                res.data.data.records[i].label1='隐私'
              }else if(i==8){
                res.data.data.records[i].label1='拍照攻击'
                res.data.data.records[i].label1='分析'
              }else if(i==9){
                res.data.data.records[i].label1='保护策略'
              }else if(i==10){
                res.data.data.records[i].label1='防御网'
                res.data.data.records[i].label2='模型'
              }else if(i==11){
                res.data.data.records[i].label1='分析方法'
                res.data.data.records[i].label1='静态检测'
              }else if(i==12){
                res.data.data.records[i].label1='分析方法'
                res.data.data.records[i].label2='静态'
              }else if(i==13){
                res.data.data.records[i].label1='恶意软件'
              }else if(i==14){
                res.data.data.records[i].label1='分析方法'
                res.data.data.records[i].label2='恶意软件'
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