// miniprogram/pages/user/settings/settings.js
const app = getApp();
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    can_register: false,
    can_upload: true,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      can_register: app.globalData.app_settings.can_register,
      can_upload: app.globalData.app_settings.can_upload,
      can_grant_admin: app.globalData.can_grant_admin
    })
  },

  can_register_switch_change(e) {
    let result = e.detail.value;
    db.collection('app_info')
      .doc('settings')
      .update({
        data: {
          can_register: result
        }
      })
    this.setData({
      can_register: result
    });
    app.globalData.app_settings.can_register = result;
  },
  can_upload_switch_change(e) {
    let result = e.detail.value;
    db.collection('app_info')
      .doc('settings')
      .update({
        data: {
          can_upload: result
        }
      })
    this.setData({
      can_upload: result
    });
    app.globalData.app_settings.can_upload = result;
  },
});