// pages/activities/activities.js
import {
  scanCodeCheckIn, checkIn
} from '../check_in/check_in.js';
import {
  getPresenterString
} from '../../utils/get_presenter_string.js';
import {
  onPullDownRefresh
} from '../../utils/on_pull_down_refresh.js';

var app = getApp();

Page({
  data: {
  },
  //扫码进入时的情形
  onLoad (query) {
    // scene 需要使用 decodeURIComponent 才能获取到生成二维码时传入的 scene
    const scene = decodeURIComponent(query.scene)
    if (scene != 'undefined')
    {
      checkIn(scene);
    }
  },
  onShow() {
    // 从数据库获取活动的信息
    const db = wx.cloud.database()
    db
      .collection('activity_info')
      .where({
        is_hidden: false
      })
      .orderBy('date', 'desc')
      .orderBy('time', 'desc')
      .limit(2)
      .get({
        success: res => {
          // console.log(res);
          let recent_activities = Array.from(res.data);
          //用 presenter_namelist 主讲人列表 生成需要展示的 presenter_string 字符串
          for (let i = 0; i < recent_activities.length; i++) {
            recent_activities[i].presenter_string = getPresenterString(recent_activities[i].presenter_namelist);
          }
          this.setData({
            recent_activities: recent_activities
          })
        },
        fail: err => {
          console.log(err);
          wx.showToast({
            title: '获取近期沙龙数据失败',
            icon: 'none'
          });
          wx.navigateBack({
            delta: 1,
          });
        }
      })
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
    scanCodeCheckIn();
  },
  // 监听用户下拉动作：刷新列表
  onPullDownRefresh() {
    onPullDownRefresh(this);
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