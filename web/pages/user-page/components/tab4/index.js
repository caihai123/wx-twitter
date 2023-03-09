// pages/user-page/components/tab3/index.js
const db = wx.cloud.database();
const _ = db.command;
const $ = _.aggregate;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    userId: String,
  },

  observers: {
    userId: function (userId) {
      if (userId) {
        this.getPostList();
      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    postList: [],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    async getPostList() {
      const { userId } = this.properties;

      const { data } = await db
        .collection("heart")
        .where({ userId })
        .limit(10)
        .get();

      this.setData({ postList: data });
    },
  },
});
