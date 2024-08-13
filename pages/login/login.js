// pages/login/login.js
const app = getApp().globalData  
Page({
  /**
   * 页面的初始数据
   */
  data: {
    username: '87247104',
    password: '123',
    user:[]
  },
  //两个监听输入框的函数
  inputUsername(e) {
    this.setData({
      username: e.detail.value
    });
  },
  inputPassword(e) {
    this.setData({
      password: e.detail.value
    });
  },
  //点击登录
  loginClick: function loginButton(){
    if(this.data.password==""||this.data.username==""){
      wx.showToast({
        title: "输入内容不能为空", // 提示的内容
        icon: "none", // 图标，默认success
        image: "", // 自定义图标的本地路径，image 的优先级高于 icon
        duration: 1500, // 提示的延迟时间，默认1500
        mask: false, // 是否显示透明蒙层，防止触摸穿透
      })
      return
    }
    //发送登录请求
    console.log(this.data.password)
    console.log(this.data.username)
    wx.request({
      url: 'http://192.168.50.32:10010/user-info/login',
      data: {
        'username':this.data.username,
        'password':this.data.password
      },
      method: 'POST',
      header: {
        'Gateway':'GoodAn',
        'content-type': 'application/json' // 默认值
      },
      success (res) {
        console.log(res.data.data)
        console.log(res.header)
        console.log(res.header['accessToken'])
        console.log(res.header['refreshToken'])
        var userInfo=[]
        userInfo=res.data.data
        userInfo.shortToken=res.header['accessToken']
        userInfo.refreshToken=res.header['refreshToken']
        console.log(userInfo)
        wx.showToast({
          title: "登录成功", // 提示的内容
          icon: "success", // 图标，默认success
          image: "", // 自定义图标的本地路径，image 的优先级高于 icon
          duration: 1500, // 提示的延迟时间，默认1500
          mask: false, // 是否显示透明蒙层，防止触摸穿透
        })
        wx.reLaunch({
          url: '/pages/mainPage/mainPage',
        })
        wx.setStorage({
          key: "userInfo",
          data: JSON.stringify(userInfo)
        })
      }
    }) 
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.getStorage({
      key: "userInfo",
      success(res) {
        console.log(res.data)
        if(res.data!=null){
          console.log(res.data)
          wx.reLaunch({
            url: '/pages/mainPage/mainPage',
          })
        }
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