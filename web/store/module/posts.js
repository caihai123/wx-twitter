const {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
} = require("../../utils/redux-toolkit");

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
    // 更新点赞列表
    updateThumbsUp(state, action) {
      const { id, thumbsUp } = action.payload;
      const found = state.entities[id];
      if (found) {
        found.thumbsUp = thumbsUp;
      }
    },
  },
  extraReducers(builder) {
    // 点赞完成后更新本地点赞列表
    builder
      .addCase(thumbsUpSync.fulfilled, (...rest) => {
        updateThumbsUp(...rest);
      })
      // 刷新动态列表成功后
      .addCase(refreshPostList.fulfilled, (state, action) => {
        postsAdapter.upsertMany(state, action.payload);
      });
  },
});

// 点赞
export const thumbsUpSync = createAsyncThunk(
  "posts/thumbsUp",
  async (id, { dispatch, getState }) => {
    const state = getState();
    const userId = selectUserId(state); // 获取当前用户的id

    // 先在本地计算结果，使页面更快响应
    const resultLocalThumbsUp = (() => {
      const localThumbsUp = selectThumbsUpById(state, id);
      if (localThumbsUp.includes(userId)) {
        return localThumbsUp.filter((item) => item !== userId);
      } else {
        return [...localThumbsUp, userId];
      }
    })();
    // 设置本地的结果
    dispatch(updateThumbsUp({ id, thumbsUp: resultLocalThumbsUp }));

    // 开始向后端传递点赞信息
    const db = wx.cloud.database();
    const { data: postThumbsUpInfo } = await db
      .collection("posts")
      .doc(id)
      .field({ thumbsUp: true })
      .get();

    const resultThumbsUp = (() => {
      const { thumbsUp = [] } = postThumbsUpInfo;
      if (thumbsUp.includes(userId)) {
        return thumbsUp.filter((item) => item !== userId);
      } else {
        return [...thumbsUp, userId];
      }
    })();

    // TOOD: 这里多个人同时点赞时可能会丢失数据
    await db
      .collection("posts")
      .doc(id)
      .update({
        data: { thumbsUp: resultThumbsUp },
      });

    return {
      id: id,
      thumbsUp: resultThumbsUp,
    };
  }
);

// 刷新动态列表，也用于初始化
export const refreshPostList = createAsyncThunk(
  "post/refreshList",
  async () => {
    const { result } = await wx.cloud.callFunction({ name: "getPosts" });
    const data = result.map(({ _id, ...rest }) => ({ id: _id, ...rest }));
    return data;
  }
);

export const { updateThumbsUp } = postsSlice.actions;

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
} = postsAdapter.getSelectors((state) => state.posts);

// 通过id找到点赞thumbsUp
export const selectThumbsUpById = (state, postId) => {
  return selectPostById(state, postId).thumbsUp;
};

export default postsSlice.reducer;
