// pages/activities/activities_detail/activities_detail.js

import {
  scanCode
} from '../../check_in/check_in.js';
import getActivityInfo from '../../../utils/get_activity_info.js'
import {getDate} from '../../../utils/date';

var app = getApp();
var that;
// let tap_title_total = 0;

Page({
  data: {
    title: "",
    presenter_string: "",
    date: "",
    is_today: false,
    time: "",
    check_in_total: "",
    checked_in: false, // 用户已签到
    is_admin: app.globalData.is_admin
  },
  onLoad: function (e) {
    that = this;
    //尝试从全局变量中读取是否有该次活动的信息，如果有就先默认填上
    if (typeof (app.globalData.current_activity) != 'undefined' && app.globalData.current_activity._id == e.id) {
      setPageData();
    }
    //从数据库获取最新数据以后再覆盖
    getActivityInfo({
        id: e.id,
      })
      .then(res => {
        let cur = res[0];
        app.globalData.current_activity = cur;
        setPageData()
      });
  },
  // tapTitle () {
  //   tap_title_total++;
  //   if (tap_title_total == 5) {
  //     tap_title_total = 0;
  //     wx.setClipboardData({
  //       data: app.globalData.current_activity._id,
  //     });
  //     this.setData({
  //       show_id: true
  //     })
  //   }
  // },
  callGallery() {
    wx.navigateTo({
      url: '/pages/gallery/album_detail/album_detail?album_id=' + app.globalData.current_activity._id,
    })
  },
  callCheckIn() {
    scanCode();
  },
  callActivityDetailAdmin(e) {
    wx.navigateTo({
      url: '/pages/activities/activities_detail_admin/activities_detail_admin?id=' +
        app.globalData.current_activity._id,
    })
  },
  onPullDownRefresh() {
    getActivityInfo({
        id: app.globalData.current_activity._id,
      })
      .then(res => {
        app.globalData.current_activity = res[0];
        setPageData();
        wx.showToast({
          title: '刷新成功',
          icon: 'none'
        })
        wx.stopPullDownRefresh()
      });
  },
});

// 将 globalData 中的活动数据渲染到页面
function setPageData() {
  let cur = app.globalData.current_activity;
  that.setData({
    // _id: cur._id,
    title: cur.title,
    presenter_string: cur.presenter_string,
    date: cur.date,
    is_today: cur.date == getDate(),
    time: cur.time,
    location: cur.location,
    check_in_total: cur.check_in_list.length,
    checked_in: cur.check_in_list.includes(app.globalData.openid),
    //如果本人是主讲人，则也是这次活动的管理员
    is_admin: app.globalData.is_admin || cur.presenter_list.includes(app.globalData.openid)
  })
}

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