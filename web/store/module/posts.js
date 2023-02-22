const {
  createSlice,
  createEntityAdapter,
} = require("../../utils/redux-toolkit");

const postsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.createTime.localeCompare(a.createTime),
});

// 使用 getInitialState 生成范式化 state 初始值
const initialState = postsAdapter.getInitialState({});

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    // 初始化动态列表
    postInit(state, action) {
      postsAdapter.upsertMany(state, action.payload);
    },
    // 点赞
    thumbsUp(state, action) {
      const { id } = action.payload;
      const existingPost = state.entities[id];
      if (existingPost) {
        existingPost.thumbsUp = (existingPost.thumbsUp || 0) + 1;
      }
    },
  },
});

export const { postInit, thumbsUp } = postsSlice.actions;

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
} = postsAdapter.getSelectors((state) => state.posts);

export default postsSlice.reducer;
