/**
 * 小程序登录
 * 第一次进入时在用户表创建数据
 * return userInfo
 */
const dayjs = require("dayjs");
const cloud = require("wx-server-sdk");
cloud.init();
const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();

  const { data: userList } = await db
    .collection("user")
    .where({ _openid: OPENID })
    .field({ createTime: false })
    .limit(1)
    .get();

  const [userInfo] = userList;

  if (userInfo) {
    const { data: tribeList } = await db
      .collection("tribes")
      .where({ members: _.all([userInfo._id]) })
      .field({ members: false })
      .get();
    return {
      ...userInfo,
      tribeList,
    };
  } else {
    // 如果不存在则帮他创建之后再返回
    await db.collection("user").add({
      data: {
        _openid: OPENID,
        createTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      },
    });
    return {
      _openid: OPENID,
    };
  }
};
