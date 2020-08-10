// pages/about/about.js

let app = getApp();

Page({
  data: {
    version: app.globalData.app_version,
    link: [
      "https://github.com/uestc-msc/wechat-mini-program/",
      "https://uestc-msc.com/"
    ]
  },
  copyLinkToClipBoard(e) {
    var link = e.currentTarget.dataset.link;
    wx.setClipboardData({data: link});
  },
})