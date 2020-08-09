// pages/activities/activities_all/activities_all.js

import getActivityInfo from '../../../utils/get_activity_info.js';
import sleep from '../../../utils/sleep';

var app = getApp();
const db = wx.cloud.database();
const _ = db.command;

let page_index = -1;
const activities_per_page = 20;

Page({
  data: {
    recent_activities_arr: []
  },
  onLoad() {
    // 从数据库获取活动的信息
    page_index++;
    wx.showLoading({
      title: '加载中',
    });
    getActivityInfo({
      skip: page_index * activities_per_page,
      limit: activities_per_page,
      callback: activities => {
        wx.hideLoading();
        if (activities.length == 0) {
          wx.showToast({
            title: '本薇薇也是有底线的',
            icon: 'none'
          });
        } else {
          this.setData({
            ['recent_activities_arr[' + page_index + ']']: activities
          })
        }
        // console.log(activities)
      },
    });
  },
  navigateToActivityDetail(e) {
    // 找到对应活动的信息并丢给全局变量，节约从数据库获取的时间
    this.data.recent_activities_arr.forEach(page => {
      page.forEach(Element => {
        if (Element._id == e.currentTarget.dataset.id) {
          app.globalData.current_activity = Element;
          return;
        }
      })
    });
    wx.navigateTo({
      url: '/pages/activities/activities_detail/activities_detail?id=' + e.currentTarget.dataset.id
    });
  },
  onPullDownRefresh() {
    this.onLoad();
    wx.showToast({
      title: '刷新成功',
      icon: 'none'
    })
    sleep(500).then(() => {
      wx.stopPullDownRefresh()
    })
  },
  // 页面上拉触底事件的处理函数
  onReachBottom() {
    this.onLoad();
  }
});

// Page({

//   /**
//    * 页面的初始数据
//    */
//   data: {

//   },

//   /**
//    * 生命周期函数--监听页面加载
//    */
//   onLoad: function (options) {

//   },

//   /**
//    * 生命周期函数--监听页面初次渲染完成
//    */
//   onReady: function () {

//   },

//   /**
//    * 生命周期函数--监听页面显示
//    */
//   onShow: function () {

//   },

//   /**
//    * 生命周期函数--监听页面隐藏
//    */
//   onHide: function () {

//   },

//   /**
//    * 生命周期函数--监听页面卸载
//    */
//   onUnload: function () {

//   },

//   /**
//    * 页面上拉触底事件的处理函数
//    */
//   onReachBottom: function () {

//   },

//   /**
//    * 用户点击右上角分享
//    */
//   onShareAppMessage: function () {

//   }
// })