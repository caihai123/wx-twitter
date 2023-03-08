import { createSlice, createAsyncThunk } from "../../utils/redux-toolkit";

export const slice = createSlice({
  name: "postList",
  initialState: {
    list: [],
    // status: "idle", // loading succeeded failed nomore
    lastPostId: "", // 当前的最后一条id,加载更多时用来定位
  },
  reducers: {
    // 添加到前面,一般用在发布动态之后
    addToBefore(state, action) {
      state.list.unshift(action.payload);
    },
  },
  extraReducers(builder) {
    builder
      .addCase(updatePostList.fulfilled, (state, action) => {
        const postList = action.payload;
        state.list = postList;
        state.lastPostId = postList[postList.length - 1]?._id;
      })
      .addCase(getFurtherPostList.fulfilled, (state, action) => {
        const postList = action.payload;
        state.list = state.list.concat(postList);
        state.lastPostId = state.list[state.list.length - 1]?._id;
      });
  },
});

// 更新所有用户信息，一般用于初始化
export const updatePostList = createAsyncThunk(
  "posts/updatePostList",
  async () => {
    const { result } = await wx.cloud.callFunction({ name: "getPostLast" });
    return result;
  }
);

// 加载更多,加载下一页
export const getFurtherPostList = createAsyncThunk(
  "posts/getFurtherPostList",
  async (_, { getState }) => {
    const lastPostId = selectLastPostId(getState());
    const { result } = await wx.cloud.callFunction({
      name: "getPostLast",
      data: { postId: lastPostId },
    });
    return result;
  }
);

export const { addToBefore } = slice.actions;

export default slice.reducer;

// 获取userId
export const selectPostList = (state) => state.postList.list;

export const selectLastPostId = (state) => state.postList.lastPostId;
