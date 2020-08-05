/*
获取某活动的签到二维码
文档：https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/qr-code/wxacode.getUnlimited.html
调用方法：

wx.cloud.callFunction({
  name: "get_check_in_wxacode",
  data: {
    id: activity_id,
    page: 'pages/activities/activities'
  },
  success(){},
  fail(){}
}
*/
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
const MAX_LIMIT = 100;

exports.main = async (event, context) => {
  console.log(event);
  console.log(context);

  try {
    const result = await cloud.openapi.wxacode.getUnlimited({
      path: 'pages/activities/activities',
      scene: 'id=' + event.id
    });
    return result;
  } catch (err) {
    return err;
  }
}