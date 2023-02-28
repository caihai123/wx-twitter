const cloud = require("wx-server-sdk");
cloud.init();
const db = cloud.database();
const _ = db.command;

// 通过用户id获取用户信息
const getUserInfo = async (id) => {
  const { data } = await db
    .collection("user")
    .doc(id)
    .field({
      _id: true,
      nickName: true,
      avatarUrl: true,
      describe: true,
    })
    .get();

  return data;
};

// 获取自己的用户Id
const getUserId = async () => {
  const wxContext = cloud.getWXContext();
  const { data: userList } = await db
    .collection("user")
    .where({ _openid: wxContext.OPENID })
    .field({ _id: true })
    .limit(1)
    .get();

  return userList[0]._id;
};

/**
 * 获取传入id用户和自己的关注状态
 * 0 是自己 1 仅我关注他 2 仅他关注我 3 互关 4 互不关
 */
const getFollowState = async (userId, myUserId) => {
  if (userId === myUserId) {
    return "0"; // 是自己
  } else {
    const [follow, fans] = await Promise.all([
      (async () => {
        // 是否是 myUserId 关注 userId
        const { total } = await db
          .collection("follow")
          .where({
            userId: myUserId,
            followId: userId,
          })
          .count();
        return total > 0;
      })(),
      (async () => {
        // 是否是 userId 关注 myUserId
        const { total } = await db
          .collection("follow")
          .where({
            userId: userId,
            followId: myUserId,
          })
          .count();
        return total > 0;
      })(),
    ]);

    if (follow && fans) {
      return "3"; // 互相关注
    } else if (follow) {
      return "1"; // 我关注他
    } else if (fans) {
      return "2"; // 他关注我
    } else {
      return "4"; // 毫无关系
    }
  }
};

// 通过id获取用户的关注列表
const getFollowList = async (event, context) => {
  const { userId } = event;

  // 获取所有关注的人
  const { data: followList } = await db
    .collection("follow")
    .where({ userId })
    .get();

  const myUserId = await getUserId(); // 自己的userId

  // 获取用户的基础信息
  const userList = await Promise.all(
    followList.map(async ({ followId }) => {
      const [userInfo, followState] = await Promise.all([
        getUserInfo(followId),
        getFollowState(followId, myUserId),
      ]);
      return {
        ...userInfo,
        followState,
      };
    })
  );

  return userList;
};

// 获取用户的粉丝列表
const getFansList = async (event, context) => {
  const { userId } = event;

  // 获取所有关注的人
  const { data: followList } = await db
    .collection("follow")
    .where({ followId: userId })
    .get();

  const myUserId = await getUserId(); // 自己的userId

  // 获取用户的基础信息
  const userList = await Promise.all(
    followList.map(async ({ userId }) => {
      const [userInfo, followState] = await Promise.all([
        getUserInfo(userId),
        getFollowState(userId, myUserId),
      ]);
      return {
        ...userInfo,
        followState,
      };
    })
  );

  return userList;
};

// 切换对每个人的关注状态
const followSwitch = async (event, context) => {
  const { userId } = event;

  const myUserId = await getUserId(); // 自己的userId

  // 先判断是否关注
  const { data } = await db
    .collection("follow")
    .where({
      userId: myUserId,
      followId: userId,
    })
    .field({ _id: true })
    .get();

  if (data && data.length) {
    // 如果已经关注则取消关注
    await db
      .collection("follow")
      .where({
        _id: _.in(data.map((item) => item._id)),
      })
      .remove();
  } else {
    // 如果没有关注则关注
    await db.collection("follow").add({
      data: {
        userId: myUserId,
        followId: userId,
      },
    });
  }

  // 重新获取关注状态
  const followState = await getFollowState(userId, myUserId);

  return {
    followState,
  };
};

exports.main = async (event, context) => {
  const { type } = event;
  switch (type) {
    case "getFollowList":
      return await getFollowList(event, context);
    case "getFansList":
      return await getFansList(event, context);
    case "followSwitch":
      return await followSwitch(event, context);
    default:
      break;
  }
};
