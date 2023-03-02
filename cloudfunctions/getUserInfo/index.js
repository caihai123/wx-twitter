// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { id } = event;
  // 获取用户基础信息
  const { data: userInfo } = await db.collection("user").doc(id).get();
  console.log(userInfo)

  // 获取好友数量
  const [{ total: follow }, { total: fans }] = await Promise.all([
    db.collection("follow").where({ userId: id }).count(),
    db.collection("follow").where({ followId: id }).count(),
  ]);

  return {
    ...userInfo,
    follow,
    fans,
    isSelf: userInfo._openid === wxContext.OPENID,
  };
};
