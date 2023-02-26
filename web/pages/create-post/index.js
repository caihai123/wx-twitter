// pages/create-moment/index.js
// TOOD：此页面还差一个删除文件的功能

import { refreshPostList } from "../../store/module/posts";
import { uploadToCloud } from "../../utils/util";
import dayjs from "dayjs";
const app = getApp();
const { dispatch } = app.store;
const maxCount = 9; // 仅上传图片时的最大数量
const maxDuration = 10; // 上传视频的最大时长

Page({
  /**
   * 页面的初始数据
   */
  data: {
    form: {
      value: "",
      imgList: [],
      video: null,
    },
    autosize: { maxHeight: 100, minHeight: 50 },
  },

  // 处理动态文本框改变
  handelValueChange(event) {
    this.setData({ "form.value": event.detail });
  },

  // 视频时长超出后触发视频编辑
  openVideoEditor(url) {
    return new Promise((resolve, reject) => {
      wx.openVideoEditor({
        filePath: url,
        maxDuration,
        success(res) {
          resolve(res);
        },
        fail(error) {
          console.error(error);
          reject(error);
        },
      });
    });
  },

  // 开始准备上传文件
  uploadBefore() {
    const { imgList, video } = this.data.form;
    const haveVideo = !!video;
    if (haveVideo || imgList.length >= maxCount) return; // 视频只能选择一个，如果已经有视频了则直接退出
    const haveImage = !!imgList.length;
    const itemList = ["拍摄", "从相册选择照片"];
    if (!haveImage) itemList.push("从相册选择视频");
    wx.showActionSheet({
      itemList: itemList,
      success: ({ tapIndex }) => {
        switch (tapIndex) {
          case 0:
            wx.chooseMedia({
              count: 1,
              mediaType: haveImage ? ["image"] : ["image", "video"],
              sourceType: ["camera"],
              sizeType: "compressed",
              maxDuration,
              success: ({ tempFiles }) => {
                /**
                 * 拍摄了照片或者视频
                 * 拍摄的视频已经通过maxDuration控制了时长
                 */
                const [file] = tempFiles;
                if (file.fileType === "image") {
                  this.setData({
                    "form.imgList": [...imgList, file],
                  });
                } else if (file.fileType === "video") {
                  this.setData({
                    "form.video": file,
                  });
                }
              },
            });
            break;
          case 1:
            wx.chooseMedia({
              count: maxCount - imgList.length,
              mediaType: ["image"],
              sourceType: ["album"],
              sizeType: "compressed",
              success: ({ tempFiles }) => {
                // 从相册选择了照片
                this.setData({
                  "form.imgList": [...imgList, ...tempFiles],
                });
              },
            });
            break;
          case 2:
            wx.chooseMedia({
              count: 1,
              mediaType: ["video"],
              sourceType: ["album"],
              sizeType: "compressed",
              success: async ({ tempFiles }) => {
                /**
                 * 从相册选择了视频
                 * 如果视频时长超过maxDuration则打开视频编辑页面
                 */
                if (tempFiles[0].duration > maxDuration) {
                  try {
                    const videoFile = await this.openVideoEditor(
                      tempFiles[0].tempFilePath
                    );
                    this.setData({
                      "form.video": videoFile,
                    });
                  } catch (error) {
                    // 放弃了编辑视频或者其他原因导致的失败
                  }
                } else {
                  this.setData({
                    "form.video": tempFiles[0],
                  });
                }
              },
            });
            break;
          default:
            wx.showToast({
              title: "无效的选择",
              icon: "none",
            });
            break;
        }
      },
    });
  },

  // 发表
  async submitForm() {
    const db = wx.cloud.database();
    const { value, imgList, video } = this.data.form;

    const params = {
      content: value,
      createTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      thumbsUp: [],
    };

    // 上传图片到云服务器
    const uploadToCloudImgList = imgList.map((item) =>
      uploadToCloud(item.tempFilePath)
    );
    await Promise.all(uploadToCloudImgList).then((imgUrls) => {
      params.imgList = imgUrls.map((item) => item.fileID);
    });

    // 上传视频到云服务器
    if (video) {
      const uploadToCloudVideo = uploadToCloud(video.tempFilePath);
      await uploadToCloudVideo.then(({ fileID }) => {
        const { tempFilePath, thumbTempFilePath, ...rest } = video;
        params.video = {
          ...rest,
          url: fileID,
        };
      });
    }

    db.collection("posts").add({
      data: params,
      success: function () {
        dispatch(refreshPostList()).unwrap();
        wx.showToast({
          title: "发表成功",
          icon: "success",
          duration: 2000,
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 2000);
      },
    });
  },

  // 图片预览
  previewImage(event) {
    const { url } = event.currentTarget.dataset;
    wx.previewImage({
      urls: this.data.form.imgList.map((item) => item.tempFilePath),
      current: url,
    });
  },
});
