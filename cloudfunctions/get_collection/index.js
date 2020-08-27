/*
获取数据库某集合中所有元素
由于小程序限制 LIMIT 20，云函数限制 LIMIT 100，故使用云函数一次拉取
调用方法：

wx.cloud.callFunction({
  name: "get_collection",
  data: {
    collection: <collection>
  },
}

其中 <collection> 可以为 'check_in_list'、'admin_list'、'album_photo_list' 或任意集合名
     <collection> 为 'check_in_list' 或 'album_photo_list' 时，还需在 data 中提供 id
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

  const res = construct_collection(event)
    .then(get_collection)
    .then(res => process_data(event, res));
  return res;
}

async function construct_collection(event) {
  const db = cloud.database();
  const _ = db.command;
  if (event.collection == 'check_in_list') {
    //查询得到 openid 组成的名单
    const res = await db
      .collection('activity_info')
      .doc(event.id)
      .get();
    const list = res.data.check_in_list;
    // 将名单的 openid 变为 username 即可返回
    const collection = db
      .collection('user_info')
      .where({
        _id: _.in(list)
      })
      .orderBy('student_id', 'asc')
      .field({
        _id: false,
        username: true,
        student_id: true
      });
    return collection;
  } else if (event.collection == 'admin_list') {
    const collection = db.collection('user_info').where({
        is_admin: true
      })
      .orderBy('exp', 'desc')
      .field({
        _id: false,
        username: true,
        student_id: true
      });
    return collection;
  } else if (event.collection == 'album_photo_list') {
    const collection = db.collection('album_info')
      .where({
        album_id: app.globalData.current_activity._id
      })
      .orderBy('url', 'desc');
    return collection;
  } else {
    const collection = db.collection(event.collection);
    return collection;
  }
}

async function get_collection(collection) {
  // 先取出集合记录总数
  const countResult = await collection.count();
  const total = countResult.total;
  if (total == 0) { // 判断为空的情况
    return {
      data: [],
      errMsg: "get_collection: 0"
    };
  } else {
    // 计算需分几次取
    const batchTimes = Math.ceil(total / MAX_LIMIT);
    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = collection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
      tasks.push(promise)
    }
    // 等待所有
    return (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data),
        errMsg: acc.errMsg,
      }
    })
  }
}

function process_data(event, res) {
  if (['check_in_list', 'admin_list'].includes(event.collection)) {
    // 解析姓名学号并拼接
    let namelist = res.data.map(Element =>
      Element.student_id.padEnd(18, ' ') + Element.username
    );
    return {
      event: event,
      namelist: namelist,
      errMsg: res.errMsg
    }
  } else {
    return res;
  }
}