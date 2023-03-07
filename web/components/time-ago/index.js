// components/time-ago/index.js
import dayjs from "dayjs";
import "../../utils/zh-cn";
dayjs.locale("zh-cn");
const relativeTime = require("../../utils/relativeTime");
dayjs.extend(relativeTime);

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    date: String,
  },

  observers: {
    date: function (val) {
      this.setData({
        dateString: this.handleRelativeTime(val),
      });
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    dateString: "",
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 处理时间为相对时间
    handleRelativeTime(time) {
      if (time) {
        const datDate = dayjs(time);
        const today = dayjs(); // 现在
        if (today.unix() - datDate.unix() < 604800) {
          // 小于7天
          return datDate.fromNow();
        } else if (today.format("YYYY") === datDate.format("YYYY")) {
          // 如果是今年
          return datDate.format("M月D日");
        } else {
          // 不是今年
          return datDate.format("YYYY年M月D日");
        }
      } else {
        return "";
      }
    },
  },
});
