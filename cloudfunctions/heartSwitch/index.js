// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const db = cloud.database();
const _ = db.command;

// 获取用户Id
// const getUserId = async (openid) => {
//   const { data: userList } = await db
//     .collection("user")
//     .where({ _openid: openid })
//     .field({ _id: true })
//     .limit(1)
//     .get();

//   return userList[0]._id;
// };

// 云函数入口函数
exports.main = async (event, context) => {
  const { postId, userId } = event;

  const { data: heart } = await db
    .collection("heart")
    .where({ postId, userId })
    .get();

  let isHeart;
  if (heart.length) {
    await db
      .collection("heart")
      .where({
        _id: _.in(heart.map((item) => item._id)),
      })
      .remove();
    isHeart = false;
  } else {
    await db.collection("heart").add({
      data: { userId, postId },
    });
    isHeart = true;
  }

  // 在查一次结果
  const resultData = await db
    .collection("heart")
    .where({ postId: postId, userId: userId })
    .count();

  return {
    isHeart,
    heartNum: resultData.total,
  };
};
