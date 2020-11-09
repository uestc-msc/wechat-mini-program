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
  clickPicture() {
    if (this.startTap == undefined || Date.now() - this.startTap > 2000) { // 第一次点击或距离第一次点击已经超过 2s，则重置
      this.startTap = Date.now();
      this.tapTime = 0;
    } else {
      this.tapTime++;
      if (this.tapTime == 5) {
        this.testMode = true;
        this.tapTime = 0;
        wx.showToast({
          title: 'tljj 女装赛高！',
          icon: 'none'
        })
      }
    }
  }
})