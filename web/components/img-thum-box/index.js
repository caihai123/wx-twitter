// components/img-thum-box/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    imgList: Array,
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    previewImage(event) {
      const { url } = event.currentTarget.dataset;
      wx.previewImage({
        urls: this.properties.imgList,
        current: url,
      });
    },
  },
});
