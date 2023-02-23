const { configureStore } = require("../utils/redux-toolkit");
import posts from "./module/posts.js";
import userInfo from "./module/userInfo";

export default configureStore({
  reducer: {
    posts,
    userInfo,
  },
});
