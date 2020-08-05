let app = getApp();
const db = wx.cloud.database();

export var title = '手动签到';

export function onLoad(e) {
  // 缓存当前活动的信息
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

export function getTotalAndSetTitle(page) {
  page.setData({
    title: title + page.data.title,
    total: app.globalData.current_activity.check_in_list.length
  });
  wx.setNavigationBarTitle({
    title: page.data.title + page.data.total,
  })
}

export function elementIsChecked(Element) {
  return app.globalData.current_activity.check_in_list.includes(Element._id);
}