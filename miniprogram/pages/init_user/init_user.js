// pages/init_user/init_user.js
Page({
  data: {
    username: "",
    school_id: "",
    telephone: ""
  },
  onLoad(e) {
    wx.getUserInfo({
      lang: "zh_CN",
      success(e) {
        // console.log(e)
      }
    })
  },
  inputName(e) {
    this.data.username = e.detail.value;
  },
  inputSchoolId(e) {
    this.data.school_id = e.detail.value;
  },
  inputTelephone(e) {
    this.data.telephone = e.detail.value;
  },

  getUserInfomation(e) {
    if (!this.data.username || !this.data.school_id || !this.data.telephone) { //如果输入信息不完整
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
    app.globalData.school_id = this.data.school_id;
    app.globalData.telephone = this.data.telephone;
    app.globalData.avatar_url = e.detail.userInfo.avatarUrl;
    app.globalData.is_admin = false;
    app.globalData.register_date = new Date().toISOString().slice(0, 10); // "2020-08-01"

    const db = wx.cloud.database()
    db.collection("user_info").add({
      data: {
        username: app.globalData.username,
        school_id: app.globalData.school_id,
        telephone: app.globalData.telephone,
        avatar_url: app.globalData.avatar_url,
        is_admin: false,
        register_date: app.globalData.avatar_url
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
          title: '向 user_info 数据库\n新增记录失败'
        })
      }
    })
  }
})