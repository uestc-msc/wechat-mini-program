// pages/activities/activities_detail/activities_detail.js

import {
  checkIn
} from '../../check_in/check_in.js';
import {
  getPresenterString
} from '../../../utils/get_presenter_string.js'

var app = getApp();

Page({
  data: {
    title: "",
    presenter_string: "",
    date: "",
    time: "",
    check_in_total: "",
    is_admin: app.globalData.is_admin
  },
  onLoad: function (e) {
    //尝试从全局变量中读取是否有该次活动的信息，如果没有就从数据库获取
    if (typeof (app.globalData.current_activity) != 'undefined' && app.globalData.current_activity._id == e.id) {

    } else {
      // console.log(e)
      const db = wx.cloud.database();
      db
        .collection('activity_info')
        .doc(e.id)
        .get({
          success: res => {
            app.globalData.current_activity = res.data;
          },
          fail: err => {
            console.log(err);
            wx.switchTab({
              url: '/pages/activities/activities'
            });
            wx.showToast({
              title: '从 id 获取活动信息失败',
              icon: 'none'
            });
          }
        });
    }

    let current_activity = app.globalData.current_activity;
    this.setData({
      title: current_activity.title,
      presenter_string: getPresenterString(current_activity.presenter_namelist, 0),
      date: current_activity.date,
      time: current_activity.time,
      location: current_activity.location,
      check_in_total: current_activity.check_in_list.length
    })
    //如果本人是主讲人，则也是这次活动的管理员
    if (current_activity.presenter_list.includes(app.globalData.openid)) {
      this.setData({
        is_admin: true
      });
    }
  },
  callCheckIn() {
    checkIn();
  },
  callActivityDetailAdmin(e) {
    wx.navigateTo({
      url: '/pages/activities/activities_detail_admin/activities_detail_admin?id=' +
        app.globalData.current_activity._id,
    })
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
//    * 页面相关事件处理函数--监听用户下拉动作
//    */
//   onPullDownRefresh: function () {

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