// pages/activities/activities_detail/lottery/lottery.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    checkInListText: [
      "微软小娜",
      "微软小冰"
    ],
    lotteryListText: "1 微软小冰\n2 微软小娜",
    index: 0,

  },
  bindPickerChange: function (e) {
    this.setData({
      index: parseInt(e.detail.value)
    })
  },
  copyListToClipBoard(e) {
    var text = this.data.lotteryListText;
    wx.setClipboardData({
      data: text
    });
  },
  drawLottery() {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  }
})