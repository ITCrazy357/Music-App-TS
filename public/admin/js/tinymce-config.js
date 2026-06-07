tinymce.init({
  selector: "textarea.textarea-mce",
  plugins: "image",
  // file_picker_callback: function (callback, value, meta) {
  //   if (meta.filetype === "image") {
  //     var input = document.createElement("input");
  //     input.setAttribute("type", "file");
  //     input.setAttribute("accept", "image/*");
  //     input.onchange = function () {
  //       var file = this.files[0];
  //       var reader = new FileReader();
  //       reader.onload = function () {
  //         var id = "blobid" + new Date().getTime();
  //         var blobCache = tinymce.activeEditor.editorUpload.blobCache;
  //         var base64 = reader.result.split(",")[1];
  //         var blobInfo = blobCache.create(id, file, base64);
  //         blobCache.add(blobInfo);
  //         callback(blobInfo.blobUri(), { title: file.name });
  //       };
  //       reader.readAsDataURL(file);
  //     };
  //     input.click();
  //   }
  // },
  skin: "oxide-dark",
  content_css: "dark",
  content_style: `
    body {
      background: #0f172a;
      color: #fff;
      font-family: Poppins, sans-serif;
      font-size: 16px;
      padding: 16px;
    }
  `,
  images_upload_url: "/admin/upload",
});
