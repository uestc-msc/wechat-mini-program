import { checkIn } from '../../check_in/check_in.js';

let app = getApp();
const db = wx.cloud.database();

export var title = '手动签到';

// 缓存当前活动的信息
export function getCurrentActivity(e) {
  if (e.id != app.globalData.current_activity._id) {
    db
      .collection('activity_info')
      .doc(e.id)
      .get({
        success: res => {
          app.globalData.current_activity = res.data;
        },
        fail: res => {
          console.log(res);
          wx.navigateBack({
            delta: 1,
          });
          wx.showToast({
            title: '活动 id 错误或无法访问数据库',
          })
        }
      })
  }
}

export function onLoad(e, page) {
  getCurrentActivity(e);
  page.setData({
    title: title + page.data.title,
    total: app.globalData.current_activity.check_in_list.length
  });
  wx.setNavigationBarTitle({
    title: page.data.title + page.data.total,
  })
}

export async function listChanged(options) {
  options.activity_id = app.globalData.current_activity._id;
  return await checkIn(options);
}

export function elementIsChecked(Element) {
  return app.globalData.current_activity.check_in_list.includes(Element._id);
}