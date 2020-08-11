// pages/activities/activities.js
import {
  scanCode,
  checkIn
} from '../check_in/check_in.js';
import getActivityInfo from '../../utils/get_activity_info';
import log from '../../utils/log';
import sleep from '../../utils/sleep';

var app = getApp();

Page({
  data: {},
  onLoad(query) {
    // scene 需要使用 decodeURIComponent 才能获取到生成二维码时传入的 scene
    const scene = decodeURIComponent(query.scene)
    if (scene != 'undefined') { //扫码进入时的情形
      wx.setClipboardData({
        data: scene,
      })
      checkIn({
        activity_id: scene
      });
    } else if (app.globalData.avatar_url == "") { //用户未完善信息
      wx.reLaunch({
        url: '/pages/init_user/init_user',
      });
    } else {
      // 从数据库获取活动的信息
      wx.showLoading({
        title: '加载中',
      });
      this.onShow()
      .then(res => {
          wx.hideLoading();
        });
    }
  },
  onShow() {
    app.globalData.current_activity = {};
    return getActivityInfo({
        limit: 2
      })
      .then(res => {
        // console.log(res)
        this.setData({
          recent_activities: res
        })
      });
  },
  navigateToActivityDetail(e) {
    // 找到对应活动的信息并丢给全局变量，节约从数据库获取的时间
    this.data.recent_activities.forEach(Element => {
      if (Element._id == e.currentTarget.dataset.id) {
        app.globalData.current_activity = Element;
        return;
      }
    });
    wx.navigateTo({
      url: '/pages/activities/activities_detail/activities_detail?id=' + e.currentTarget.dataset.id
    });
  },
  navigateToActivityAll() {
    wx.navigateTo({
      url: 'activities_all/activities_all',
    })
  },
  navigateToCreateActivity(e) {
    wx.navigateTo({
      url: '/pages/activities/create_activity/create_activity',
    })
  },
  callCheckIn() {
    scanCode();
  },
  // 监听用户下拉动作：刷新列表
  onPullDownRefresh() {
    this.onShow()
    .then(res => {
        wx.showToast({
          title: '刷新成功',
          icon: 'none'
        })
        wx.stopPullDownRefresh()
      });
  }
});

// Page({

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