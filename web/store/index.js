const { configureStore } = require("../utils/redux-toolkit");
import posts from "./module/posts.js"

export default configureStore({
  reducer: {
    posts: posts,
  },
});