export function main() {
  wx.request({

    url: 'https://api.weixin.qq.com/cgi-bin/token', //仅为示例，并非真实的接口地址
    data: {
      grant_type: 'client_credential',
      appid: this.globalData.app_id,
      secret: this.globalData.app_secret
    },
    header: {
      'content-type': 'application/json' // 默认值
    },
    success(res) {
      console.log(res.data);
      that.globalData.access_token = res.data.access_token;
      wx.request({
        url: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=' + that.globalData.access_token,
        data: {
          'scene': '123456789123',
          'path': "/pages/my/my?uid=1",
          'width': 430
        },
        method: 'POST',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          console.log(that.globalData.access_token);
          console.log(res.data);
        }
      })
    }
  })
}