// pages/activities/activities_detail/activities_detail.js
import {
    checkIn
} from '../../check_in/check_in.js';
var base64 = require("../../../images/base64");

Page({
    mixins: [require('../../../mixin/themeChanged')],
    onLoad: function () {
        this.setData({
            icon: base64.icon20
        });
    },
    data: {
        date: "2016-09-01",
        time: "12:01"
    },
    bindDateChange: function (e) {
        this.setData({
            date: e.detail.value
        })
    },
    bindTimeChange: function (e) {
        this.setData({
            time: e.detail.value
        })
    },
    callCheckInList() {
        wx.navigateTo({
            url: 'check_in_list/check_in_list',
        })
    },
    callGallery() {

    },
    callCheckIn() {
        checkIn();
    },
    callLottery() {
        wx.navigateTo({
            url: 'lottery/lottery',
        })
    },
    saveChange() {

    }
});


// Page({

//   /**
//    * 页面的初始数据
//    */
//   data: {

//   },

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