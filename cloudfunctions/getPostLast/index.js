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

// 获取所有正在关注列表
const getFollowList = async (userId) => {
  const model = db.collection("follow").where({ userId });
  const { total: followTotal } = await model.count();
  // 一次最多查多少条数据
  const MAX_LIMIT = 100;
  // 计算需分几次取
  const batchTimes = Math.ceil(followTotal / MAX_LIMIT);
  const tasks = [];

  for (let i = 0; i < batchTimes; i++) {
    const promise = model
      .field({ followId: true })
      .skip(i * MAX_LIMIT)
      .limit(MAX_LIMIT)
      .get();
    tasks.push(promise);
  }

  const followList = (await Promise.all(tasks)).reduce((acc, cur) => {
    return acc.concat(cur.data || []);
  }, []);

  return followList.map((item) => item.followId);
};

// 通过postId查找他在当前条件下的index
const findIndex = async (postId, queryWhere) => {
  const model = db
    .collection("posts")
    .orderBy("createTime", "desc")
    .where(queryWhere);

  // 先查出数据总数
  const { total } = await model.count();

  // 一次最多查多少条数据
  const MAX_LIMIT = 100;
  // 计算需分几次取
  const batchTimes = Math.ceil(total / MAX_LIMIT);

  for (let i = 0; i < batchTimes; i++) {
    const { data } = await model
      .field({ _id: true })
      .skip(i * MAX_LIMIT)
      .limit(MAX_LIMIT)
      .get();

    const index = data.findIndex((item) => item._id === postId);
    if (index !== -1) {
      return index + i * MAX_LIMIT + 1;
    }
  }

  return -1;
};

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { postId } = event;

  // 获取自己的用户ID
  const userId = await getUserId(wxContext.OPENID);

  // 获取正在关注列表
  const followList = await getFollowList(userId);

  // 需要跳过的数量
  const skipNum = await (async () => {
    if (postId) {
      return await findIndex(postId, { userId: _.in([userId, ...followList]) });
    } else {
      return 0;
    }
  })();

  console.log(skipNum);

  const { data } = await db
    .collection("posts")
    .orderBy("createTime", "desc")
    // 查询自己和关注者的动态
    .where({ userId: _.in([userId, ...followList]) })
    .field({ _id: true })
    .skip(skipNum)
    .limit(10)
    .get();

  return data;
};
