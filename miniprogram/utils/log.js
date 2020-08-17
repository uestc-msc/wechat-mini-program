import {
  getTime,
  getDate
} from './date.js'

/**
 * 向数据库写入用户操作日志
 * 推荐对一切需要写数据库的操作记录日志
 * 详细规则见 https://github.com/uestc-msc/wechat-mini-program/blob/master/README.md#操作日志-log
 * @param oper 操作名 
 * @param data 相关数据，如图片信息、活动信息等
 * @returns `Promise`
 */
export default function (options) {
  const db = wx.cloud.database();
  return db.collection('log').add({
    data: {
      date: getDate(),
      time: getTime(true),
      oper: options.oper,
      data: options.data
    }
  })
}