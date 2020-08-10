// pages/activities/activities_all/activities_all.js

import getActivityInfo from '../../../utils/get_activity_info.js';
import sleep from '../../../utils/sleep';

var app = getApp();
const db = wx.cloud.database();
const _ = db.command;

let page_index;
const activities_per_page = 20;

Page({
  data: {
    recent_activities_arr: []
  },
  onLoad() {
    page_index = 0;
    this.loadOnePage();
  },
  onShow() {
    app.globalData.current_activity = undefined;
  },
  loadOnePage() {
    console.log('Page:', page_index)
    // 从数据库获取活动的信息
    wx.showLoading({
      title: '加载中',
    });
    getActivityInfo({
      skip: page_index * activities_per_page,
      limit: activities_per_page,
    })
    .then(activities => {
      wx.hideLoading();
      if (activities == undefined || activities.length == 0) {
        wx.showToast({
          title: '本薇薇也是有底线的',
          icon: 'none'
        });
      } else {
        this.setData({
          ['recent_activities_arr[' + page_index + ']']: activities
        });
        page_index++;
      }
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
    this.setData({
      recent_activities_arr: []
    })
    this.onLoad();
    sleep(500).then(() => {
      wx.stopPullDownRefresh()
    })
  },
  // 页面上拉触底事件的处理函数
  onReachBottom() {
    this.loadOnePage();
  }
});