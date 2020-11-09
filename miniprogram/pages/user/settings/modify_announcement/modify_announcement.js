// miniprogram/pages/user/settings/modify_announcement/modify_announcement.js

const app = getApp();
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    announcement_value: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      announcement_value: app.globalData.app_settings.announcement
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

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

  },
  inputing(e) {
    // console.log(e);
    this.setData({
      announcement_value: e.detail.value
    });
  },
  submit(e) {
    // console.log(e);
    wx.showLoading({
      title: '提交修改',
    })

    db.collection("app_info")
    .doc("settings")
    .update({
      data: {
        announcement: this.data.announcement_value
      }
    }).then(res => {
      app.globalData.app_settings.announcement = this.data.announcement_value;
      wx.showToast({
        title: '修改成功',
        icon: 'success'
      })
    }).catch(res => {
      wx.showToast({
        title: '修改失败',
      })
    });
  }
})