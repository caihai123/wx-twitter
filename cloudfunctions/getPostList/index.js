// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

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

  // 获取自己的用户ID
  const userId = await getUserId(wxContext.OPENID);

  if (userId) {
    // 获取关注者列表
    const { data: followList } = await db
      .collection("follow")
      .where({ userId })
      .get();

    const { list } = await db
      .collection("posts")
      .aggregate()
      .match({
        // 查询自己和关注者的动态
        userId: _.in([...followList.map((item) => item.followId), userId]),
      })
      // 获取此动态的用户信息
      .lookup({
        from: "user",
        // localField: "userId",
        // foreignField: "_id",
        let: { userId: "$userId" },
        as: "user",
        pipeline: $.pipeline()
          .match(_.expr($.eq(["$_id", "$$userId"])))
          .project({
            _id: true,
            nickName: true,
            avatarUrl: true,
            describe: true,
          })
          .limit(1)
          .done(),
      })
      // 获取喜欢的人的数量
      .lookup({
        from: "heart",
        let: { postId: "$_id" },
        as: "heart",
        pipeline: $.pipeline()
          .match(_.expr($.eq(["$postId", "$$postId"])))
          .project({ _id: true, userId: true })
          .done(),
      })
      .addFields({
        user: $.arrayElemAt(["$user", 0]),
        heartNum: $.size("$heart"),
      })
      .project({ _openid: false })
      .end();
    return list.map((item) => {
      const { heart, ...rest } = item;
      return {
        // 自己是否喜欢
        isHeart: heart.some((item) => item.userId === userId),
        ...rest,
      };
    });
  } else {
    return {
      errMsg: "当前用户不存在",
    };
  }
};
