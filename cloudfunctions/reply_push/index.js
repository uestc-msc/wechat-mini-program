// 当留言被回复的时候，推送微信消息
const cloud = require('wx-server-sdk')
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  console.log(event)

  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: event.userId,
      page: event.page,
      lang: 'zh_CN',
      data: event.data,
      templateId: event.templateId
    })
    console.log(result)
    return result
  } catch (err) {
    console.log(err)
    return err
  }
}