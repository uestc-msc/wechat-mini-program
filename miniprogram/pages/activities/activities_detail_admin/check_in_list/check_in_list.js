// pages/activities/activities_detail/check_in_list/check_in_list.js

import {
  sleep
} from '../../../../utils/sleep';

var app = getApp();

Page({
  data: {
    title: app.globalData.current_activity.title,
    checke_in_total: '',
    check_in_name_text: ''
  },
  copyListToClipBoard(e) {
    var text = this.data.check_in_name_text;
    wx.setClipboardData({
      data: text
    });
  },

  onLoad: async function (e) {
    //尝试从全局变量中读取是否有该次活动的信息，如果没有就从数据库获取
    if (typeof (app.globalData.current_activity) == 'undefined' || app.globalData.current_activity._id != e.id) {
      // console.log(e)
      await this.fetchCurrentActivity(e.id);
    }
  },
  async fetchCurrentActivity(id) {
    const db = wx.cloud.database();
    const _ = db.command;
    //查询得到名单
    await db
      .collection('activity_info')
      .doc(id)
      .get({
        success: res => {
          console.log(res);
          app.globalData.current_activity = res.data;
          //
          db
            .collection('user_info')
            .where({
              _id: _.in(app.globalData.current_activity.check_in_list)
            })
            .get({
              success: res => {
                console.log(res);
                check_in_namelist = [];
                res.data.forEach(Element => {
                  check_in_namelist.push(Element.username);
                });
                this.setData({
                  title: app.globalData.current_activity.title,
                  checke_in_total: check_in_namelist.length,
                  check_in_name_text: check_in_namelist.join('\n')
                });
              },
              fail: err => {
                console.log(err);
              }
            })
        },
        fail: err => {
          console.log(err);
          wx.navigateBack({
            delta: 1,
          })
          wx.showToast({
            title: '参数错误或无法访问数据库',
            icon: 'none'
          });
        }
      });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  async onPullDownRefresh() {
    this.fetchCurrentActivity(app.globalData.current_activity._id)
    .then(() => {
      wx.showToast({
        title: '刷新成功',
        icon: 'none'
      })
      sleep(500).then(() => {
        wx.stopPullDownRefresh()
      })
    });

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})