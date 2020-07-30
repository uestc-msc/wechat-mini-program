// pages/init_user/init_user.js
Page({
  data: {

  },

  //加载页面前先判断是否有该人信息。如果有了，就直接 redirectTo url: '../activities/activities'
  // 还要申请读取个人微信号

  confirmInput () {

    //存储信息
    //wx.redirectTo({ // 跳转到有tabBar页面必须使用 wx.switchTab 而不能用其他语法，否则会跳转失败
      wx.switchTab({
    url: '../activities/activities',
    })
    wx.showToast({
      title: '完善成功',
      icon: 'success',
      duration: 2000
    });
  }
})