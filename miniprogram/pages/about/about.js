// pages/about/about.js
Page({
  data: {
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