// pages/about/about.js
Page({
  data: {
    version: "v0.1",
    link: [
      "https://github.com/uestc-msc/wechat-mini-program/",
      "https://uestc-msc.github.io/"
    ]
  },
  copyLinkToClipBoard(e) {
    var link = e.currentTarget.dataset.link;
    wx.setClipboardData({data: link});
  }
})