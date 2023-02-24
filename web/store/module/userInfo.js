import { createSlice } from "../../utils/redux-toolkit";

export const slice = createSlice({
  name: "userInfo",
  initialState: {
    _id: "",
    _openid: "",
    nickName: "",
    avatarUrl: "",
    describe: "",
  },
  reducers: {
    // 更新所有用户信息，一般用于初始化
    updateUserInfo(state, action) {
      const { _id, _openid, nickName, avatarUrl, describe } = action.payload;
      state._id = _id;
      state._openid = _openid;
      state.nickName = nickName;
      state.avatarUrl = avatarUrl;
      state.describe = describe;
    },
  },
});

export const { updateUserInfo } = slice.actions;

export default slice.reducer;

// 获取userId
export const selectUserId = (state) => state.userInfo._id;

// 获取所有用户信息
export const selectUserInfo = (state) => state.userInfo;