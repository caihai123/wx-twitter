// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database();
  const _ = db.command;
  const $ = db.command.aggregate;

  // 获取自己的用户信息
  const { data: userList } = await db
    .collection("user")
    .where({ _openid: wxContext.OPENID })
    .field({ tribes: true })
    .limit(1)
    .get();
  const userInfo = userList[0];

  // 获取关注者列表
  const { data: followList } = await db
    .collection("follow")
    .where({
      userId: userInfo._id,
    })
    .get();

  if (userInfo) {
    const { list } = await db
      .collection("posts")
      .aggregate()
      .match({
        // 查询自己和关注者的动态
        userId: _.in([
          ...followList.map((item) => item.followId),
          userInfo._id,
        ]),
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
        heartNum: $.size("$heart"), // 喜欢的人的数量
        isHeart: $.in([userInfo._id, "$heart"]), // 自己是否喜欢
      })
      .project({ _openid: false, heart: false })
      .end();
    return list;
  } else {
    return {
      errMsg: "当前用户不存在",
    };
  }
};
