// pages/myPage/myPage.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user:[],
    showModal:false,
    countDownTime: 60, // 倒计时的秒数
    isCountDown: false,
    codeInput:"",
    emailInput:"",
    peopleList: []
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
        console.log(this.data.user)
      }
    })
  },
  //验证码输入框
  codeChange: function (e) {
    // 获取输入框的值
    let inputValue = e.detail.value;
    // 更新数据
    this.setData({
      codeInput: inputValue
    });
  },
  //邮箱输入框
  emailChange: function (e) {
    // 获取输入框的值
    let inputValue = e.detail.value;
    // 更新数据
    this.setData({
      emailInput: inputValue
    });
  },
  //邮箱正则
  regexEmail:function(){
    //正则
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    console.log(this.data.emailInput)
    console.log(regex.test(this.data.emailInput)) 
    if(this.data.emailInput==""){
      wx.showToast({
        title: "请输入邮箱", // 提示的内容
        icon: "none", // 图标，默认success
        image: "", // 自定义图标的本地路径，image 的优先级高于 icon
        duration: 1500, // 提示的延迟时间，默认1500
        mask: false, // 是否显示透明蒙层，防止触摸穿透
      })
      return false
    }
    if(!regex.test(this.data.emailInput)){
      wx.showToast({
        title: "邮箱格式不正确", // 提示的内容
        icon: "none", // 图标，默认success
        image: "", // 自定义图标的本地路径，image 的优先级高于 icon
        duration: 1500, // 提示的延迟时间，默认1500
        mask: false, // 是否显示透明蒙层，防止触摸穿透
      })
      return false
    }
    return true
  },
  //获取邮箱验证码
  modalObtainCode:function(){
    var flag=this.regexEmail()
    console.log(flag)
    if(!flag){
      return
    }
    var that=this
    //发送请求
    var userInfo=this.data
    console.log(userInfo)
    console.log(userInfo.shortToken)
    console.log(that.data.emailInput)
    console.log(that.data.codeInput)
    wx.request({
      url: "http://10.251.23.120:8084/user-info/sendCode",
      header:{
        "Authorization": userInfo.shortToken,
        'content-type': 'application/json' // 默认值
      },
      data:{
        "email":that.data.emailInput
      },
      method: 'GET',
      success (res) {
        console.log(res.data.data)
        wx.showToast({
          title: "成功发送", // 提示的内容
          icon: "success", // 图标，默认success
          image: "", // 自定义图标的本地路径，image 的优先级高于 icon
          duration: 1500, // 提示的延迟时间，默认1500
          mask: false, // 是否显示透明蒙层，防止触摸穿透
        })
      }
    }) 
  },
  //修改邮箱
  modalConfirmClick:function(){
    var flag=this.regexEmail()
    console.log(flag)
    if(!flag){
      return
    }
    if(this.data.codeInput==""){
      wx.showToast({
        title: "请输入验证码", // 提示的内容
        icon: "none", // 图标，默认success
        image: "", // 自定义图标的本地路径，image 的优先级高于 icon
        duration: 1500, // 提示的延迟时间，默认1500
        mask: false, // 是否显示透明蒙层，防止触摸穿透
      })
      return
    }
    var that=this
    console.log(that.data.emailInput)
    console.log(that.data.codeInput)
    //发送请求
    wx.getStorage({
      key: "userInfo",
      success(res) {
        var userInfo=JSON.parse(res.data)
        console.log(that.data.emailInput)
        console.log(that.data.codeInput)//2171204141@qq.com
        var there=that
        wx.request({
          url: "http://10.251.23.120:8084/user/emailBind?email="+there.data.emailInput+"&code="+there.data.codeInput,
          header:{
            "Authorization": userInfo.shortToken,
            'content-type': 'application/json' // 默认值
          },
          method: 'POST',
          success (res) {
            console.log(res.data.data)
            var userX=there.data.user
            userX.emial=there.data.emailInput
            this.setData({
              user: userX
            });
            console.log(there.data.user)
            wx.showToast({
              title: "邮箱更改成功", // 提示的内容
              icon: "success", // 图标，默认success
              image: "", // 自定义图标的本地路径，image 的优先级高于 icon
              duration: 1500, // 提示的延迟时间，默认1500
              mask: false, // 是否显示透明蒙层，防止触摸穿透
            })
          }
        }) 
      }
    })
    this.setData({
      showModal:false
    })
  },
  //弹窗
  btn:function () {
    this.setData({
      emailInput: "",
      codeInput:""
    });
    this.setData({
      showModal:true
    })
  },
   // 弹出层里面的弹窗
   modalCancelClick:function () {
    this.setData({
      showModal:false
    })
  },
  //点击修改头像
  avatarClick: function(){
    var that =this
    console.log("点击头像")
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: res => {
          wx.getFileSystemManager().readFile({
              filePath: res.tempFiles[0].tempFilePath, //选择图片返回的相对路径
              encoding: 'base64', //编码格式
              success: res => { //成功的回调
                  let url = 'data:image/png;base64,' + res.data
                  console.log(url)
                  console.log(that.data.user)
                  console.log(that.data.user.account)
                  wx.request({
                    url: "http://10.251.23.120:8084/testPaper/uploadAvatar?account="+that.data.user.account,
                    // url:"http://192.168.9.105:9080/testPaper/uploadAvatar"+that.data.user.account,
                    headers:{
                      "Authorization": that.data.shortToken,
                      'content-type': 'multipart/form-data;' // 默认值
                    },
                    formData:{
                      "avatar": url
                    },
                    method: 'POST',
                    success (res) {
                      console.log(res.data.data)
                    }
                  }) 
              }
            })
          }
    })
  },
  //倒计时
  countDown: function () {
    let that = this;
    while (this.data.countDownTime > 0 && !this.data.isCountDown) {
      console.log(that.data.countDownTime)
      this.interval = setInterval(function () {
        that.setData({
          countDownTime: that.data.countDownTime - 1
        });
        if (that.data.countDownTime <= 0) {
          clearInterval(that.interval);
        }
      }, 1000);
      this.setData({
        isCountDown: true
      });
    }
  },
  stopCountDown: function () {
    if (this.data.isCountDown) {
      clearInterval(this.interval);
      this.setData({
        isCountDown: false
      });
    }
  },
  //点击退出登录
  exitLoginClick: function(){
    wx.removeStorageSync ("userInfo") 
    console.log("退出登录")
    wx.reLaunch({
      url: '/pages/login/login',
      success: function(res) {
        wx.showToast({
          title: "注销成功", // 提示的内容
          icon: "success", // 图标，默认success
          image: "", // 自定义图标的本地路径，image 的优先级高于 icon
          duration: 1500, // 提示的延迟时间，默认1500
          mask: false
        })
      }
    });
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