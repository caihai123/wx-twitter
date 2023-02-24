// pages/edit-user-info/index.js
import { selectUserInfo, updateUserInfo } from "../../store/module/userInfo";
const app = getApp();
const { dispatch, getState } = app.store;
import { uploadToCloud } from "./../../utils/util";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    _id: "",
    wallImg: {
      url: "",
      new: false, // 是否是临时地址
    },
    avatar: {
      url: "",
      new: false, // 是否是临时地址
    },
    nickName: "",
    describe: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const userInfo = selectUserInfo(getState());
    this.setData({
      _id: userInfo._id,
      nickName: userInfo.nickName,
      "avatar.url": userInfo.avatarUrl,
      "wallImg.url": userInfo.wallUrl,
      describe: userInfo.describe,
    });
  },

  onNickNameChange(event) {
    this.setData({ nickName: event.detail });
  },
  onDescribeChange(event) {
    this.setData({ describe: event.detail });
  },

  // 头像上传成功
  onAvatarUrlChange(event) {
    const { avatarUrl } = event.detail;
    console.log(event)
    this.setData({
      avatar: {
        url: avatarUrl,
        new: true,
      },
    });
  },

  // 处理背景墙上图标的点击事件
  handleWallUpdate() {
    const itemList = ["拍摄", "从相册选择"];
    if (this.data.wallImg.url) {
      itemList.push("移除");
    }
    wx.showActionSheet({
      itemList: itemList,
      success: ({ tapIndex }) => {
        switch (tapIndex) {
          case 0:
            wx.chooseMedia({
              count: 1,
              mediaType: ["image"],
              sourceType: ["camera"],
              sizeType: "compressed",
              success: ({ tempFiles }) => {
                this.onWallUrlChange(tempFiles[0]);
              },
            });
            break;
          case 1:
            wx.chooseMedia({
              count: 1,
              mediaType: ["image"],
              sourceType: ["album"],
              sizeType: "compressed",
              success: ({ tempFiles }) => {
                this.onWallUrlChange(tempFiles[0]);
              },
            });
            break;
          case 2:
            this.setData({
              wallImg: {
                url: "",
                new: false,
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

  // 处理背景墙照片上传成功
  onWallUrlChange({ tempFilePath }) {
    // 开始裁剪图片
    this.cropImage(tempFilePath, "16:9")
      .then(({ tempFilePath }) => {
        this.setData({
          wallImg: {
            url: tempFilePath,
            new: true,
          },
        });
      })
      .catch(() => {
        this.setData({
          wallImg: {
            url: tempFilePath,
            new: true,
          },
        });
      });
  },

  submitForm() {
    if (!this.formValidate()) {
      return;
    }
    const { _id, wallImg, avatar, nickName, describe } = this.data;

    const uploadTasks = [wallImg, avatar].map((item) => {
      if (item.new) {
        return uploadToCloud(item.url);
      } else {
        return new Promise((resolve) => resolve({ fileID: item.url }));
      }
    });

    Promise.all(uploadTasks).then(
      ([{ fileID: wallImgUrl }, { fileID: avatarUrl }]) => {
        const db = wx.cloud.database();
        const params = {
          nickName,
          describe,
          avatarUrl: avatarUrl,
          wallUrl: wallImgUrl,
        };
        db.collection("user")
          .doc(_id)
          .update({ data: params })
          .then(() => {
            wx.showToast({
              title: "更新成功",
              icon: "success",
              duration: 2000,
            });
            const userInfo = selectUserInfo(getState());
            dispatch(
              updateUserInfo({
                ...userInfo,
                ...params,
              })
            );
            setTimeout(() => {
              wx.navigateBack();
            }, 2000);
          });
      }
    );
  },

  // 字段验证
  formValidate() {
    const { avatar, nickName } = this.data;
    if (!avatar.url) {
      wx.showToast({
        title: "请上传头像",
        icon: "none",
      });
      return false;
    }
    if (!nickName) {
      wx.showToast({
        title: "请填写昵称",
        icon: "none",
      });
      return false;
    }
    return true;
  },

  // 裁剪图片
  cropImage(imgSrc, cropScale) {
    return new Promise((resolve, reject) => {
      wx.cropImage({
        src: imgSrc,
        cropScale,
        success: (res) => resolve(res),
        fail: (err) => reject(err),
      });
    });
  },
});
