// pages/user/user.js
import {
  sleep
} from '../../utils/sleep';

var app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    username: "",
    avatar_url: "",
    student_id: "",
    can_grant_admin: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 如果没有 username 则每 0.5s 尝试 onShow
    if (app.globalData.username == '') {
      sleep(500).then(() => this.onShow());
    } else {
      this.setData({
        username: app.globalData.username,
        avatar_url: app.globalData.avatar_url,
        student_id: app.globalData.student_id,
        can_grant_admin: app.globalData.can_grant_admin
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  // 监听用户下拉动作：刷新列表
  onPullDownRefresh() {
    this.onShow();
    wx.showLoading({
      title: 'title',
    })
    wx.showToast({
      title: '刷新成功',
      icon: 'none'
    })
    sleep(300).then(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})