import getActivityInfo from '../../../utils/get_activity_info'

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
  const _ = db.command;
  const oper = options.checked ? _.push : _.pull; // 数据库操作：添加/删除
  // 更新 list
  let res = await db
    .collection('activity_info')
    .doc(app.globalData.current_activity._id)
    .update({
      data: {
        check_in_list: oper(options.user_id)
      }
    });
  // 获取新的 presenter_string 存储并刷新上一页
  getActivityInfo({
    id: app.globalData.current_activity._id
  }).then(res => {
    let cur = res[0];
    app.globalData.current_activity = cur;
    let pages = getCurrentPages();
    let last_page = pages[pages.length - 2]; // 上一页
    last_page.onPullDownRefresh();
  });
  return res;
}

export function elementIsChecked(Element) {
  return app.globalData.current_activity.check_in_list.includes(Element._id);
}