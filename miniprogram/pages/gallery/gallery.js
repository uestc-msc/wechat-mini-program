// pages/gallery/gallery.js

import getActivityInfo from '../../utils/get_activity_info.js';
import sleep from '../../utils/sleep.js'

let app = getApp();
let page_index;
const activities_per_page = 20;
let activities_arr;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    activities_arr: [],
    activities_length: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    page_index = 0;
    activities_arr = [];
    // 获取活动总数
    wx.cloud.database().collection('activity_info')
      .where({
        is_hidden: false
      })
      .count()
      .then(res => {
        this.setData({
          activities_total: res.total
        })
      })
    return this.loadOnePage();
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
    app.globalData.current_activity = undefined;
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
  onPullDownRefresh() {
    this.onLoad()
    .finally(() => {
      console.log(1)
      wx.stopPullDownRefresh()
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.loadOnePage();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  async loadOnePage() {
    const db = wx.cloud.database();
    //获取前 activities_per_page 个活动信息
    wx.showLoading({
      title: '加载中'
    });
    return getActivityInfo({
        skip: page_index * activities_per_page,
        limit: activities_per_page,
      })
      .then(res => {
        wx.hideLoading();
        if (res == undefined || res.length == 0) {
          wx.showToast({
            title: '本薇薇也是有底线的',
            icon: 'none'
          });
        } else {
          Array().push.apply(activities_arr, res); // 合并两个数组
          this.setData({
            activities_arr: activities_arr
          });
          page_index++;
          return res;
        }
      })
      .catch(err => {
        console.log(err);
        wx.showToast({
          title: '数据出错啦 _(:з」∠)_',
          icon: 'none'
        });
        return err;
      })
  },

  tapAlbum: function (event) {
    app.globalData.current_activity = event.currentTarget.dataset.item;
    wx.navigateTo({
      url: '/pages/gallery/album_detail/album_detail?album_id=' +
        event.currentTarget.dataset.item._id,
    })
  },
})