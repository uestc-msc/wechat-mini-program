// pages/activities/create_activity/create_activity.js

import {
  getDate
} from '../../../utils/date.js';

var app = getApp();

Page({
  data: {
    username: "",
    today: getDate(),

    title: "",
    presenter_string: "",
    date: getDate(), // 默认日期为今天
    time: "20:00",   // 默认时间
    location: ""
  },
  onLoad: function (options) {
    app.globalData.current_activity = {
      title: "",
      presenter_list: [app.globalData.openid], // 默认为本人
      presenter_namelist: [app.globalData.username],
      avatar_url: app.globalData.avatar_url,
      date: "",
      time: "",
      location: "",
      check_in_list: [],
      is_hidden: true
    };
    this.setData({
      presenter_string: app.globalData.username
    });
    // 由于主讲人列表是在另一个页面写入
    // 所以就先在数据库中创建本次活动的记录
    // 如果最后活动没有被创建，就再删除本条记录
    const db = wx.cloud.database()
    db.collection('activity_info').add({
      data: app.globalData.current_activity,
      success: res => {
        app.globalData.current_activity._id = res._id;
        app.globalData.current_activity._openid = app.globalData.openid;
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.log(err);
      }
    })
  },
  //非管理员尝试修改主讲人时的提示
  modifyPresenter() {
    if (app.globalData.is_admin) {
      wx.navigateTo({
        url: 'url',
      })
    } else {
      wx.showToast({
        title: '非管理员不能修改主讲人哦',
        icon: 'none',
        duration: 1000
      });
    }
  },
  // 时间被修改
  bindTimeChange(e) {
    // console.log(e);
    this.setData({
      time: e.detail.value
    })
  },
  // 日期被修改
  bindDateChange(e) {
    // console.log(e);
    this.setData({
      date: e.detail.value
    })
  },
  // “创建活动”按钮
  inputSubmit(e) {
    // console.log(e);
    var value = e.detail.value;
    if (!value.location || !value.title){
      wx.showToast({
        title: '请把消息补充完整喔',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    // 将其他信息存入为全局变量
    app.globalData.current_activity.title = value.title;
    app.globalData.current_activity.date = value.date;
    app.globalData.current_activity.time = value.time;
    app.globalData.current_activity.location = value.location;
    app.globalData.current_activity.is_hidden = false;
    // 将其他信息存入数据库
    const db = wx.cloud.database();
    db.collection('activity_info')
    .doc(app.globalData.current_activity._id)
    .update({
      data: {
        title: value.title,
        date: value.date,
        time: value.time,
        location: value.location,
        is_hidden: false
      },
      success: res => {
        wx.redirectTo({
          url: '/pages/activities/activities_detail/activities_detail?id='
          + app.globalData.current_activity._id,
        });
        wx.showToast({
          title: '创建成功',
          duration: 2000
        })
      },
      fail: err => {
        console.log(err);
        wx.showToast({
          title: '创建失败',
          duration: 2000,
          icon: 'none'
        });
      }
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
    // console.log('onHide')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // console.log('onUnload')
    // console.log(this.data)
    if(app.globalData.current_activity.is_hidden){
      const db = wx.cloud.database();
      db.collection('activity_info')
      .doc(app.globalData.current_activity._id)
      .remove({
        success: res => {
          console.log('成功删除记录 ', activitiy_id);
        },
        fail: res => {
          console.log('删除记录失败 ', activitiy_id);
        }
      })
    }
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