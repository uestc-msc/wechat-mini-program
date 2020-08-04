// pages/check_in/check_in.js

export function checkIn() {
  wx.scanCode({
    success: res => {
      console.log(res);
      wx.showToast({
        title: 'title',
      });
      wx.setClipboardData({
        data: 'title',
      })
    }
  })
};