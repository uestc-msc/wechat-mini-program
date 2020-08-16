// pages/gallery/gallery.js

import getActivityInfo from '../../utils/get_activity_info.js';
import sleep from '../../utils/sleep.js'

let app = getApp();

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
  onLoad: function (options) {
    this.photoDB = wx.cloud.database().collection('album_info');
    this.page_index = 0;
    this.activities_per_page = 20; // 一定要是偶数
    this.activities_total = 0;
    // 获取前 activities_per_page 个活动
    this.loadOnePage();
    // 获取活动总数
    wx.cloud.database().collection('activity_info')
      .where({
        is_hidden: false
      })
      .count()
      .then(res => {
        this.activities_total = res.total;
        this.setData({
          title: `相册(${this.activities_total})`
        })
      })
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
  onPullDownRefresh() {
    this.setData({
      activities_arr: []
    })
    this.onLoad();
    sleep(500).then(() => {
      wx.stopPullDownRefresh()
    })
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

  loadOnePage() {
    const db = wx.cloud.database();
    //获取前 activities_per_page 个活动信息
    wx.showLoading({
      title: '加载中'
    });
    getActivityInfo({
        skip: this.page_index * this.activities_per_page,
        limit: this.activities_per_page,
      })
      .then(res => {
        wx.hideLoading();
        if (res == undefined || res.length == 0) {
          wx.showToast({
            title: '本薇薇也是有底线的',
            icon: 'none'
          });
        } else {
          this.setData({
            ['activities_arr[' + this.page_index + ']']: Array.from(res)
          });
          this.page_index++;
        }
      })
      .catch(err => {
        console.log(err);
        wx.showToast({
          title: '数据出错啦 _(:з」∠)_',
          icon: 'none'
        });
      })
  },

  tapAlbum: function (event) {
    wx.navigateTo({
      url: '/pages/gallery/gallery_detail?album_id='
       + event.currentTarget.dataset.item._id,
    })
  },
})