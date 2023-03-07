import { createSlice, createAsyncThunk } from "../../utils/redux-toolkit";

export const slice = createSlice({
  name: "postList",
  initialState: [],
  reducers: {
    // 加载更多,向后面添加
    loadMore(state, action) {
      state.push(...action.payload);
    },
    // 添加到前面,一般用在发布动态之后
    addBefore(state, action) {
      state.unshift(action.payload);
    },
  },
  extraReducers(builder) {
    builder.addCase(updatePostList.fulfilled, (state, action) => {
      return action.payload;
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

export const { addBefore } = slice.actions;

export default slice.reducer;

// 获取userId
export const selectPostList = (state) => state.postList;
