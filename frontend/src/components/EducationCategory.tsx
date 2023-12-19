import { Upload } from "antd";
import React, { useContext, useState } from "react";
import VideoCard from "./videoCard";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { UploadProps, message } from "antd/lib";
import { RcFile, UploadChangeParam, UploadFile } from "antd/lib/upload";
import eduImage from "/public/edu.jpg";
import { StateContext } from "../contexts/generContext";

const beforeUpload = (file: RcFile) => {
  console.log(file.size);
  const isVideo = file.type === "video/mp4";
  if (!isVideo) {
    message.error("You can only upload mp4 file!");
  }
  const isLt2M = file.size / 1024 / 1024 < 20;
  if (!isLt2M) {
    message.error("Video must smaller than 2MB!");
  }
  return isVideo && isLt2M;
};

const EducationCategory = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>();
  const [state, dispatch] = useContext(StateContext);

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const getBase64 = (img: RcFile, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result as string));
    reader.readAsDataURL(img);
  };

  const handleChange: UploadProps["onChange"] = (
    info: UploadChangeParam<UploadFile>
  ) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj as RcFile, (url) => {
        setLoading(false);
        setVideoUrl(url);
      });
    }
  };
  const imageLink =
    state?.type == "Education"
      ? eduImage
      : "https://youtu.be/3wDiqlTNlfQ?si=V5ZyMvfSyyNm0YfI";

  const title =
    state?.type == "Education"
      ? "React Tutorial for Beginners "
      : "LEO - Naa Ready Song Video | Thalapathy Vijay | Lokesh Kanagaraj | Anirudh Ravichander";

  return (
    <div className="video-card-container">
      <Upload
        name="avatar"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
        beforeUpload={beforeUpload}
        onChange={handleChange}
      >
        {uploadButton}
      </Upload>
      {props?.a.map((_:any, i:any) => {
        return <VideoCard imageLink={imageLink} i={i} title={title} />;
      })}
    </div>
  );
};

export default EducationCategory;
