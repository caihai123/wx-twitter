import { createSlice } from "../../utils/redux-toolkit";

export const slice = createSlice({
  name: "userinfo",
  initialState: {
    _id: "",
    _openid: "",
    nickName: "",
    avatarUrl: "",
    describe: "",
  },
  reducers: {
    // 更新所有用户信息，一般用于初始化
    updateUserinfo(state, action) {
      const { _id, _openid, nickName, avatarUrl, describe } = action.payload;
      state._id = _id;
      state._openid = _openid;
      state.nickName = nickName;
      state.avatarUrl = avatarUrl;
      state.describe = describe;
    },
  },
});

export const { updateUserinfo } = slice.actions;

export default slice.reducer;
