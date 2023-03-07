import { createApi } from "../../utils/redux-toolkit-query";

// 自定义查询
const customWxQuery = async (args, api, extraOptions) => {
  const db = wx.cloud.database();
  const { url, body } = args;

  try {
    if (new RegExp(/^\/get-post-item\/\w*/g).test(args)) {
      // 获取单条动态信息
      const postId = new RegExp(
        /^\/get-post-item\/((?:[^\/]+?))(?:\/(?=$))?$/i
      ).exec(args)[1];
      const { result } = await wx.cloud.callFunction({
        name: "getPostInfo",
        data: { id: postId },
      });
      return { data: result };
    } else if (new RegExp(/^\/get-user-info\/\w*/g).test(args)) {
      // 获取用户信息
      const userId = new RegExp(
        /^\/get-user-info\/((?:[^\/]+?))(?:\/(?=$))?$/i
      ).exec(args)[1];
      const { data } = await db.collection("user").doc(userId).get();
      return { data };
    } else if (url === "/handle-heart-switch") {
      const { userId, postId, isHeart } = body;
      if (isHeart) {
        await db.collection("heart").add({ data: { postId, userId } });
      } else {
        await db.collection("heart").where({ postId, userId }).remove();
      }
      return { data: "success" };
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
    getUserInfoById: builder.query({
      query: (userId) => `/get-user-info/${userId}`,
      providesTags: (result, error, arg) => [{ type: "User", id: arg }],
    }),

    // 处理爱心被点击
    handleHeartChange: builder.mutation({
      query: (params) => ({
        url: "/handle-heart-switch",
        body: params,
      }),
      async onQueryStarted({ postId, isHeart }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          apiSlice.util.updateQueryData("getPostItemById", postId, (draft) => {
            draft.isHeart = isHeart;
            draft.heartNum = isHeart ? ++draft.heartNum : --draft.heartNum;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: "Post", id: arg.postId },
      ],
    }),
  }),
});

// 获取单条动态数据
export const selectPostItem = apiSlice.endpoints.getPostItemById.select();
export const selectUserItem = apiSlice.endpoints.getUserInfoById.select();
