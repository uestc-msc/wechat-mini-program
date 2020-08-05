let app = getApp();
const db = wx.cloud.database();

export var title = '设置管理员';

export function onLoad() {
  if (!app.globalData.can_grant_admin) {
    wx.navigateBack({
      delta: 1,
    });
    wx.showToast({
      title: '没有权限',
      icon: 'none'
    });
  }
}

export function getTotalAndSetTitle(page) {
  db
  .collection('user_info')
  .where({
    is_admin: true
  })
  .count({
    success: res => {
      page.setData({
        title: title + page.data.title,
        total: res.total
      });
      wx.setNavigationBarTitle({
        title: page.data.title + page.data.total,
      });
    },
    fail: res => {
      console.log(res);
      wx.showToast({
        title: '获取总人数失败',
        icon: 'none'
      });
    }
  });
}

export function elementIsChecked(Element) {
  return Element.is_admin;
}

export function listChanged(id) {
  return 0;
}