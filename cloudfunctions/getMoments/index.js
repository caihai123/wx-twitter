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
    .get();
  const userInfo = userList[0];

  if (userInfo) {
    const { tribes = [] } = userInfo; // 自己所在的群
    const { list } = await db
      .collection("moment")
      .aggregate()
      .match({ tribleId: _.in([...tribes, "", null, undefined]) })
      .lookup({
        from: "user",
        as: "user",
        let: { openid: "$_openid" },
        pipeline: $.pipeline()
          .match(_.expr($.and([$.eq(["$_openid", "$$openid"])])))
          .project({
            nickName: true,
            avatarUrl: true,
            describe: true,
            gender: true,
          })
          .limit(1)
          .done(),
      })
      .addFields({ user: $.arrayElemAt(["$user", 0]) })
      .project({ _openid: false })
      .end();
    // return list.map(({ user, ...rest }) => ({ ...rest, user: user[0] }));
    return list;
  } else {
    return {
      errMsg: "当前用户不存在",
    };
  }
};
