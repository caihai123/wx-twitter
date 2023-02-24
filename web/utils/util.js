
// 上传文件到云服务器
export const uploadToCloud = (fileUrl) => {
  const cloudPath = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
  return wx.cloud.uploadFile({
    cloudPath,
    filePath: fileUrl,
  });
};
