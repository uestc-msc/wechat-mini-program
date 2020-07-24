// pages/init_user/init_user.js
Page({
  data: {

  },

  //加载页面前先判断是否有该人信息。如果有了，就直接 redirectTo url: '../activities/activities'
  // 还要申请读取个人微信号

  confirmInput () {

    //存储信息
    //如果数据库已经有人叫这个名字，但没有其他信息（是被管理员添加的沙龙主讲人）
    //则把信息赋给数据库对应的人
    //否则新建一个人
    wx.redirectTo({
      url: '../activities/activities',
    })
    wx.showToast({
      title: '完善成功',
      icon: 'success',
      duration: 2000
    });
  }
})