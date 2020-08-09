// pages/user/modify_information/modify_information.js

var app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    username: "",
    telephone: "",
    student_id: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var app = getApp();
    // console.log(app.globalData.username);
    this.setData({
      username: app.globalData.username,
      telephone: app.globalData.telephone,
      student_id: app.globalData.student_id
    })
  },

  submitInput(e) {
    if (!e.detail.value.username || !e.detail.value.student_id || !e.detail.value.telephone) { //如果输入信息不完整
      wx.showToast({
        title: '请输入完整信息哦',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    //将信息保存为全局变量
    app.globalData.username = e.detail.value.username;
    app.globalData.student_id = e.detail.value.student_id;
    app.globalData.telephone = e.detail.value.telephone;

    //将信息加入对应用户的数据库
    const db = wx.cloud.database()
    const _ = db.command
    db.collection("user_info").doc(app.globalData.openid).update({
        data: {
          username: app.globalData.username,
          student_id: app.globalData.student_id,
          telephone: app.globalData.telephone,
        }
      })
      .then(res => {
        wx.navigateBack({
          delta: 1,
        });
        wx.showToast({
          title: '修改成功',
          icon: 'success',
          duration: 2000
        });
      })
      .catch(err => {
        console.log(err)
        wx.showToast({
          icon: 'none',
          title: '向数据库 修改记录失败'
        })
      });
  }
})