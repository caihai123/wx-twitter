const {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
} = require("../../utils/redux-toolkit");
import dayjs from "dayjs";
import "../../utils/zh-cn";
dayjs.locale("zh-cn");
const relativeTime = require("../../utils/relativeTime");
dayjs.extend(relativeTime);
import { selectUserId } from "./userInfo";

const postsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.createTime.localeCompare(a.createTime),
});

// 使用 getInitialState 生成范式化 state 初始值
const initialState = postsAdapter.getInitialState({});

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    // 用于本地处理喜欢状态
    updateHeart(state, action) {
      const { id } = action.payload;
      const found = state.entities[id];
      if (found) {
        if (found.isHeart) {
          found.heartNum--;
        } else {
          found.heartNum++;
        }
        found.isHeart = !found.isHeart;
      }
    },
  },
  extraReducers(builder) {
    // 点赞完成后更新本地点赞列表
    builder
      .addCase(heartSwitch.fulfilled, (state, action) => {
        const { id, heartNum, isHeart } = action.payload;
        const found = state.entities[id];
        if (found) {
          found.heartNum = heartNum;
          found.isHeart = isHeart;
        }
      })
      // 刷新动态列表成功后
      .addCase(refreshPostList.fulfilled, (state, action) => {
        postsAdapter.upsertMany(state, action.payload);
      });
  },
});

// 处理喜欢操作
export const heartSwitch = createAsyncThunk(
  "posts/heartSwitch",
  async (id, { dispatch, getState }) => {
    const state = getState();
    const userId = selectUserId(state); // 获取当前用户的id

    // 先在本地设置结果，使页面更快响应
    dispatch(updateHeart({ id }));

    // 开始向后端传递点赞信息
    const { result } = await wx.cloud.callFunction({
      name: "heartSwitch",
      data: {
        userId,
        postId: id,
      },
    });

    return {
      id: id,
      heartNum: result.heartNum,
      isHeart: result.isHeart,
    };
  }
);

// 处理时间为相对时间
const handleRelativeTime = (time) => {
  const datDate = dayjs(time);
  const today = dayjs(); // 现在
  if (today.unix() - datDate.unix() < 604800) {
    // 小于7天
    return datDate.fromNow();
  } else if (today.format("YYYY") === datDate.format("YYYY")) {
    // 如果是今年
    return datDate.format("M月D日");
  } else {
    // 不是今年
    return datDate.format("YYYY年M月D日");
  }
};

// 刷新动态列表，也用于初始化
export const refreshPostList = createAsyncThunk(
  "post/refreshList",
  async () => {
    const { result } = await wx.cloud.callFunction({ name: "getPostList" });
    const data = result.map(({ _id, createTime, ...rest }) => {
      const relativeTimeString = handleRelativeTime(createTime);
      return { id: _id, date: relativeTimeString, createTime, ...rest };
    });
    return data;
  }
);

export const { updateHeart } = postsSlice.actions;

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
} = postsAdapter.getSelectors((state) => state.posts);

export default postsSlice.reducer;
