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
    let old_name = app.globalData.username;
    let new_name = e.detail.value.username;
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
        // 还要同时修改相关沙龙主讲人的名字（presenter_namelist 字段）
        // 查询数据库中该人主讲的所有沙龙
        // 然后删除旧名字，添加新名字
        // 这里不考虑两位主讲人重名导致删除错误的情况了
        let c = db.collection("activity_info").where({
          presenter_list: _.all([app.globalData.openid])
        });
        c.update({
          data: {
            presenter_namelist: _.pull(old_name)
          }
        });
        c.update({
          data: {
            presenter_namelist: _.push(new_name)
          }
        });
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