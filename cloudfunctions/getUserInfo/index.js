// 通过id获取用户信息

const cloud = require("wx-server-sdk");

cloud.init();

const db = cloud.database();

// 获取用户Id
const getUserId = async (openid) => {
  const { data: userList } = await db
    .collection("user")
    .where({ _openid: openid })
    .field({ _id: true })
    .limit(1)
    .get();

  return userList[0]._id;
};

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { id } = event;
  // 获取用户基础信息
  const { data: userInfo } = await db.collection("user").doc(id).get();

  // 获取好友数量
  const [{ total: followNum }, { total: fansNum }] = await Promise.all([
    db.collection("follow").where({ userId: id }).count(),
    db.collection("follow").where({ followId: id }).count(),
  ]);

  const selfUserId = await getUserId(wxContext.OPENID);

  // 我是否关注他
  const isFollow = await (async () => {
    const { total } = await db
      .collection("follow")
      .where({ userId: selfUserId, followId: id })
      .count();
    return total > 0;
  })();

  // 他是否关注我
  const isFans = await (async () => {
    const { total } = await db
      .collection("follow")
      .where({ userId: id, followId: selfUserId })
      .count();
    return total > 0;
  })();

  return {
    ...userInfo,
    followNum,
    isFollow,
    fansNum,
    isFans,
    isSelf: userInfo._openid === wxContext.OPENID,
  };
};
