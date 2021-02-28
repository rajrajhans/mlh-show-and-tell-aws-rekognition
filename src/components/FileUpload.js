import React from "react";

const FileUpload = ({ image, setImage, setIsLoading }) => {
  function handleImageUpload(e) {
    setIsLoading(true);
    let file = e.target.files[0];
    let reader = new FileReader();

    reader.onloadend = function () {
      const base64string = reader.result.replace(
        /^data:image\/[a-z]+;base64,/,
        ""
      );

      setImage(base64string);
      e.target.value = "";
    };

    reader.readAsDataURL(file);
  }
  return (
    <div className={"file-upload-container"}>
      <h3>Upload an image</h3>
      <input type={"file"} onChange={handleImageUpload} />
    </div>
  );
};

export default FileUpload;
