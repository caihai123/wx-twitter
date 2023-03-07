const { configureStore } = require("../utils/redux-toolkit");
import posts from "./module/posts.js";
import userInfo from "./module/userInfo";
import { apiSlice } from "./module/apiSlice";

export default configureStore({
  reducer: {
    posts,
    userInfo,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
