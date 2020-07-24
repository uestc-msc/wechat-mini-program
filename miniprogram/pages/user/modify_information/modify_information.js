// pages/user/modify_information/modify_information.js
Page({
  data: {

  },

  confirmInput() {
    //检查数据合法性
    //存储数据
    wx.navigateBack({
      delta: 1,
    });
    wx.showToast({
      title: '修改成功',
      icon: 'success',
      duration: 2000
    });
  }
})