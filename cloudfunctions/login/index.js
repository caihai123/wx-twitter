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
    return userInfo;
  } else {
    // 如果不存在则帮他创建之后再返回
    const defaultUserInfo = {
      _openid: OPENID,
      nickName: "微信用户",
      avatarUrl: "",
      describe: "",
    };
    const result = await db.collection("user").add({
      data: {
        ...defaultUserInfo,
        createTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      },
    });
    return {
      _id: result._id,
      ...defaultUserInfo,
    };
  }
};
