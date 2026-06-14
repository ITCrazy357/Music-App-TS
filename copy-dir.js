const fs = require("fs-extra");
const listFolderCopy = [
  {
    sourceDirectory: "views",
    targetDirectory: "dist/views",
  },
  {
    sourceDirectory: "public",
    targetDirectory: "dist/public",
  },
];

listFolderCopy.forEach((item) => {
  fs.copy(item.sourceDirectory, item.targetDirectory, (err) => {
    if (err) {
      console.error(
        `Lỗi sao chep folder ${item.sourceDirectory} sang ${item.targetDirectory}: ${err}`,
      );
    } else {
      console.log(
        `Sao chép thành công folder ${item.sourceDirectory} sang ${item.targetDirectory}`,
      );
    }
  });
});
