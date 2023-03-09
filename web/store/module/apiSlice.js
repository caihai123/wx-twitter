import { createApi } from "../../utils/redux-toolkit-query";
import { createSelector } from "../../utils/redux-toolkit";

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
      const { result } = await wx.cloud.callFunction({
        name: "getUserInfo",
        data: { id: userId },
      });
      return { data: result };
    } else if (url === "/handle-heart-switch") {
      // 处理动态上的点赞切换
      const { userId, postId, isHeart } = body;
      const model = db.collection("heart");
      if (isHeart) {
        await model.add({ data: { postId, userId } });
      } else {
        await model.where({ postId, userId }).remove();
      }
      return { data: "success" };
    } else if (url === "/handle-follow-switch") {
      // 处理好友关系的切换
      const { userId, followId, isFollow } = body;
      const model = db.collection("follow");
      if (isFollow) {
        await model.add({ data: { followId, userId } });
      } else {
        await model.where({ followId, userId }).remove();
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

    // 处理关注按钮的切换
    handelFollowChange: builder.mutation({
      query: (params) => ({
        url: "/handle-follow-switch",
        body: params,
      }),
      async onQueryStarted(
        { followId, isFollow },
        { dispatch, queryFulfilled }
      ) {
        const patchResult = dispatch(
          apiSlice.util.updateQueryData(
            "getUserInfoById",
            followId,
            (draft) => {
              draft.isFollow = isFollow;
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: "User", id: arg.followId },
      ],
    }),
  }),
});

// 获取单条动态数据
export const selectPostItem = createSelector(
  [(state, postId) => apiSlice.endpoints.getPostItemById.select(postId)(state)],
  (postItem) => postItem.data
);

// 获取单个用户
export const selectUserItem = createSelector(
  [(state, userId) => apiSlice.endpoints.getUserInfoById.select(userId)(state)],
  (userItem) => userItem.data
);
