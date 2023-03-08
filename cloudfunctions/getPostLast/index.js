// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const db = cloud.database();
const _ = db.command;

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

  // 获取正在关注列表
  const followList = await (async () => {
    const model = db.collection("follow").where({ userId });
    const { total: followTotal } = await model.count();
    // 一次最多查多少条数据
    const MAX_LIMIT = 100;
    // 计算需分几次取
    const batchTimes = Math.ceil(followTotal / MAX_LIMIT);
    const tasks = [];
    for (let i = 0; i < batchTimes; i++) {
      const promise = model
        .skip(i * MAX_LIMIT)
        .limit(MAX_LIMIT)
        .get();
      tasks.push(promise);
    }
    return (await Promise.all(tasks)).reduce((acc, cur) => {
      return acc.concat(cur.data || []);
    }, []);
  })();

  const { data } = await db
    .collection("posts")
    .orderBy("createTime", "desc")
    .where({
      // 查询自己和关注者的动态
      userId: _.in([...followList.map((item) => item.followId), userId]),
    })
    .field({ _id: true })
    .limit(10)
    .get();

  return data;
};
