// pages/check_in/check_in.js
import {getDate} from '../../utils/date';

var app = getApp();

// “扫码签到” 按钮的回调函数
export function scanCode() {
  wx.scanCode({
    success: res => {
      let id = res.result;
      console.log(id);
      checkIn(id);
    }
  })
};

export async function checkIn(options) {
  if (options.activity_id == undefined) {
    wx.navigateBack({
      delta: 1,
    });
    wx.showToast({
      title: '参数 activity_id 为空',
      icon: 'none'
    })
  }
  if (options.userid == undefined) {
    options.userid = app.globalData.openid;
  }
  const db = wx.cloud.database();
  wx.showLoading({
    title: '正在签到',
    mask: true
  })
  // 从数据库加载该次活动信息
  if (getApp().globalData.current_activity.current_activity == undefined
      || options.activity_id != app.globalData.current_activity._id) {
        await db.collection('activity_info')
        .doc(options.activity_id)
        .get({
          success: res => {
            app.globalData.current_activity = res.data;
            console.log(1);
          },
          fail: err => {
            console.log(err);
              console.log(1);
            wx.showToast({
              title: err.errMsg,
              icon: 'none',
              duration: 10000
            });
          }
        });
      }
      console.log(1);
  if (getDate() != app.globalData.current_activity.date) {
    wx.showToast({
      title: '活动当天才可以签到哦',
      icon: 'none'
    })
    return;
  }
  wx.hideLoading();
}