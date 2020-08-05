/*
获取某活动的签到二维码
文档：https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/qr-code/wxacode.getUnlimited.html
注意，只有上架后应用才能正确识别该二维码，参见 https://developers.weixin.qq.com/community/develop/doc/0006ccac2786b8fb73f9f843d51400?_at=vyxqpllafi
也可以考虑换用 wxacode.get 接口，但由于该接口只能生成十万个码，
可能还需要考虑将生成过的二维码缓存到服务器，节约 API 申请次数

调用方法：

wx.cloud.callFunction({
  name: "get_check_in_wxacode",
  data: {
    id: activity_id,
  },
  success(){},
  fail(){}
}
*/
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  console.log(event);
  console.log(context);

  try {
    const result = await cloud.openapi.wxacode.getUnlimited({
      scene: event.id,
      path: 'pages/activities/activities'
    });
    return result;
  } catch (err) {
    return err;
  }
}