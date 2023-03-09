import { createSlice, createSelector } from "../../utils/redux-toolkit";

export const slice = createSlice({
  name: "userInfo",
  initialState: {
    _id: "",
    _openid: "",
    nickName: "",
    avatarUrl: "",
    describe: "",
    wallUrl: "",
    follow: "",
    fans: "",
  },
  reducers: {
    // 更新所有用户信息，一般用于初始化
    updateUserInfo(state, action) {
      const {
        _id,
        _openid,
        nickName,
        avatarUrl,
        describe,
        wallUrl,
        follow,
        fans,
      } = action.payload;
      state._id = _id;
      state._openid = _openid;
      state.nickName = nickName;
      state.avatarUrl = avatarUrl;
      state.describe = describe;
      state.wallUrl = wallUrl;
      state.follow = follow;
      state.fans = fans;
    },
  },
});

export const { updateUserInfo } = slice.actions;

export default slice.reducer;

// 获取userId
export const selectUserId = (state) => state.userInfo._id;

// 获取所有用户信息
export const selectUserInfo = createSelector((state) => state.userInfo);
