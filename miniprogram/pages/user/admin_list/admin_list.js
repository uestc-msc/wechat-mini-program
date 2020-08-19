// pages/user/admin_list/admin_list.js

var app = getApp();
var that;

Page({
  data: {
    title: '',
    admin_total: 0,
    admin_name_text: ''
  },
  copyListToClipBoard(e) {
    var text = this.data.admin_name_text;
    wx.setClipboardData({
      data: text
    });
  },
  onLoad: function (e) {
    that = this;
    getAdminList();
  },
  async onPullDownRefresh() {
    await getAdminList().then(wx.stopPullDownRefresh);
  }
})

async function getAdminList(id) {
  wx.showLoading({
    title: '加载中',
    mask: true
  });
  await wx.cloud.callFunction({
    name: 'get_admin_list',
    success: res => {
      that.setData({
        admin_name_text: res.result.namelist.join('\n'),
        admin_total: res.result.namelist.length
      })
      wx.hideLoading();
    }
  })
}