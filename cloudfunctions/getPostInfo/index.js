// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const db = cloud.database();

// 获取用户id
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

  // 动态基本信息
  const { data: postItem } = await db.collection("posts").doc(id).get();

  // 动态被喜欢的数量
  const { total: heartNum } = await db
    .collection("heart")
    .where({ postId: id })
    .count();

  // 当前用户的id
  const userId = await getUserId(wxContext.OPENID);

  // 当前用户是否喜欢该动态
  const isHeart = await (async () => {
    const { total } = await db
      .collection("heart")
      .where({ postId: id, userId })
      .count();
    return total > 0;
  })();

  return {
    ...postItem,
    heartNum,
    isHeart,
  };
};
