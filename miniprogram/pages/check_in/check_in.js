// pages/check_in/check_in.js
import {getDate} from '../../utils/date';

var app = getApp();

export function scanCodeCheckIn() {
  wx.scanCode({
    success: res => {
      let id = res.result;
      console.log(id);
      checkIn(id);
    }
  })
};

export function checkIn(activity_id) {
  const db = wx.cloud.database();
  wx.showLoading({
    title: '正在签到',
    mask: true
  })
  // 从数据库加载该次活动信息
  if (getApp().globalData.current_activity.current_activity == undefined
      || activity_id != app.globalData.current_activity._id) {
        db.collection('activity_info')
        .doc(activity_id)
        .get({
          success: res => {
            app.globalData.current_activity = res.data;
          },
          fail: err => {
            console.log(err);
            wx.showToast({
              title: err.errMsg
            });
          }
        });
      }
  if (getDate() != app.globalData.current_activity.date) {
    wx.showToast({
      title: '活动当天才可以签到哦',
      icon: 'none'
    })
    return;
  }
  wx.hideLoading();
}