// pages/activities/activities.js
var base64 = require("../../images/base64");

Page({
    mixins: [require('../../mixin/themeChanged')],
    onLoad: function(){
        this.setData({
            icon20: base64.icon20,
            icon60: base64.icon60
        });
    },
    data: {
        // 放四个沙龙比较好
        recent_salon: [
            {
                topic: "第一场沙龙",
                presenter: "阮薇薇",
                date: "2020.7.24",
                time: "20:00",
                place: "品A101"
            },
            {
                topic: "第二场沙龙",
                presenter: "阮薇薇",
                date: "2020.8.24",
                time: "8:00",
                place: "腾讯课堂"
            }
        ]
    }
});

// Page({

//   /**
//    * 生命周期函数--监听页面加载
//    */
//   onLoad: function (options) {

//   },

//   /**
//    * 生命周期函数--监听页面初次渲染完成
//    */
//   onReady: function () {

//   },

//   /**
//    * 生命周期函数--监听页面显示
//    */
//   onShow: function () {

//   },

//   /**
//    * 生命周期函数--监听页面隐藏
//    */
//   onHide: function () {

//   },

//   /**
//    * 生命周期函数--监听页面卸载
//    */
//   onUnload: function () {

//   },

//   /**
//    * 页面相关事件处理函数--监听用户下拉动作
//    */
//   onPullDownRefresh: function () {

//   },

//   /**
//    * 页面上拉触底事件的处理函数
//    */
//   onReachBottom: function () {

//   },

//   /**
//    * 用户点击右上角分享
//    */
//   onShareAppMessage: function () {

//   }
// })