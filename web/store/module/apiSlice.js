import { createApi } from "../../utils/redux-toolkit-query";

// 自定义查询
const customWxQuery = async (args, api, extraOptions) => {
  const db = wx.cloud.database();

  try {
    if (new RegExp(/^\/get-post-item\/\w*/g).test(args)) {
      // 获取单条动态信息
      const postId = new RegExp(
        /^\/get-post-item\/((?:[^\/]+?))(?:\/(?=$))?$/i
      ).exec(args)[1];
      const { data } = await db.collection("posts").doc(postId).get();
      return { data };
    } else if (new RegExp(/^\/get-user-item\/\w*/g).test(args)) {
      // 获取用户信息
      const userId = new RegExp(
        /^\/get-user-item\/((?:[^\/]+?))(?:\/(?=$))?$/i
      ).exec(args)[1];
      const { data } = await db
        .collection("user")
        .doc(userId)
        .get();
      return { data };
    } else {
      return { data: undefined };
    }
  } catch (error) {
    return { error };
  }
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: customWxQuery,
  tagTypes: ["Post", "User"],
  endpoints: (builder) => ({
    // 获取单个动态信息
    getPostItemById: builder.query({
      query: (postId) => `/get-post-item/${postId}`,
      providesTags: (result, error, arg) => [{ type: "Post", id: arg }],
    }),

    // 获取用户信息
    getUserItemById: builder.query({
      query: (userId) => `/get-user-item/${userId}`,
      providesTags: (result, error, arg) => [{ type: "User", id: arg }],
    }),
  }),
});
