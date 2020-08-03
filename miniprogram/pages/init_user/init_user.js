// pages/init_user/init_user.js

import {getDate} from '../../utils/date.js';

Page({
  data: {
    username: "",
    student_id: "",
    telephone: ""
  },
  // 隐藏左上角的 home
  onShow(){
    if(wx.canIUse('hideHomeButton')){
      wx.hideHomeButton()
      }
  },
  inputName(e) {
    this.data.username = e.detail.value;
  },
  inputSchoolId(e) {
    this.data.student_id = e.detail.value;
  },
  inputTelephone(e) {
    this.data.telephone = e.detail.value;
  },
  //按钮触发的函数
  getUserInfomation(e) {
    if (!this.data.username || !this.data.student_id || !this.data.telephone) { //如果输入信息不完整
      wx.showToast({
        title: '请输入完整信息哦',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    var app = getApp();

    //将信息保存为全局变量
    app.globalData.username = this.data.username;
    app.globalData.student_id = this.data.student_id;
    app.globalData.telephone = this.data.telephone;
    app.globalData.avatar_url = e.detail.userInfo.avatarUrl;
    app.globalData.is_admin = false;
    app.globalData.can_grant_admin = false;
    app.globalData.register_date = getDate(); // "2020-08-01"

    const db = wx.cloud.database()
    db.collection("user_info").add({
      data: {
        _id: app.globalData.openid, //将本条记录的 id 也设置为 openid
        username: app.globalData.username,
        student_id: app.globalData.student_id,
        telephone: app.globalData.telephone,
        avatar_url: app.globalData.avatar_url,
        is_admin: app.globalData.is_admin,
        can_grant_admin: app.globalData.can_grant_admin,
        register_date: app.globalData.register_date
      },
      success: res => {
        wx.switchTab({
          url: '../activities/activities',
        })
        wx.showToast({
          title: '完善成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '向 user_info 数据库 新增记录失败'
        })
      }
    })
  }
})