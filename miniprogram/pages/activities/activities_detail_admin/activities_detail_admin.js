// pages/activities/activities_detail_admin/activities_detail_admin.js

import {
  checkIn
} from '../../check_in/check_in.js';
import {
  getPresenterString
} from '../../../utils/get_presenter_string.js'
import {
  getDate
} from '../../../utils/date.js';

var app = getApp();

Page({
  data: {
    today: getDate(),
    title: "",
    presenter_string: "",
    date: "",
    time: "",
    check_in_total: "",
    is_admin: false,

    show_dialog: false,
  },
  onLoad: function(e) {
    //尝试从全局变量中读取是否有该次活动的信息，如果没有就从数据库获取
    if (typeof (app.globalData.current_activity) != 'undefined' && app.globalData.current_activity._id == e.id) {} else {
      // console.log(e)
      const db = wx.cloud.database();
      db
        .collection('activity_info')
        .doc(e.id)
        .get({
          success: res => {
            app.globalData.current_activity = res.data;
            console.log(res.data);
          },
          fail: err => {
            console.log(err);
            wx.redirectTo({
              url: '/pages/activities/activities',
            });
            wx.showToast({
              title: '参数错误或无法访问数据库',
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
    //如果本人是主讲人或全局的管理员，则也是这次活动的管理员
    if (app.globalData.is_admin || current_activity.presenter_list.includes(app.globalData.openid)) {
      this.setData({
        is_admin: true
      });
    } else {
      wx.navigateBack({
        delta: 1,
      });
      wx.showToast({
        title: '你还不是管理员 不能进入这种地方的',
        icon: 'none',
        duration: 2000
      });
    }
  },
  modifyPresenter() {
    if (app.globalData.is_admin) {
      wx.navigateTo({
        url: '/pages/people_selector/people_selector?id=' +
          app.globalData.current_activity._id +
          '&modify=presenter_list'
      })
    } else {
      //非管理员尝试修改主讲人时的提示
      wx.showToast({
        title: '非管理员不能修改主讲人哦',
        icon: 'none',
        duration: 1000
      });
    }
  },
  bindDateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange(e) {
    this.setData({
      time: e.detail.value
    })
  },
  showCheckIn2DCode(e) {

  },
  checkInManually(e) {
    wx.navigateTo({
      url: '/pages/people_selector/people_selector?id='
      + app.globalData.current_activity._id
      + '&modify=check_in_list',
    })
  },
  showCheckInList() {
    wx.navigateTo({
      url: 'check_in_list/check_in_list',
    })
  },
  callGallery() {

  },
  callCheckIn() {
    checkIn();
  },
  callLottery() {
    wx.navigateTo({
      url: 'lottery/lottery',
    })
  },
  inputSubmit(e) {
    // console.log(e);
    var value = e.detail.value;
    var that = this;
    if (!value.location || !value.title) {
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
        },
        success: res => {
          //修改上一页面的信息，然后 navigateBack 到上一页
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2];
          prevPage.setData( app.globalData.current_activity);
          wx.navigateBack({
            delta: 1,
          });
          wx.showToast({
            title: '修改成功',
            duration: 2000
          })
        },
        fail: err => {
          console.log(err);
          wx.showToast({
            title: '修改失败',
            duration: 2000,
            icon: 'none'
          });
        }
      });
  },
  deleteActivity() {
    wx.showModal({
      title: '确认删除',
      content: '真的要删除吗？这是不可逆的哦',
      success (res) {
        if (res.confirm) {
          const db = wx.cloud.database();
          db
          .collection('activity_info')
          .doc(app.globalData.current_activity._id)
          .update({
            data: {
              is_hidden: true
            },
            success: res => {
              wx.navigateBack({
                delta: 2,
              });
              wx.showToast({
                title: '删除成功',
              });
            },
            fail: err => {
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              });
            }
          });
        } else if (res.cancel) {
        }
      }
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