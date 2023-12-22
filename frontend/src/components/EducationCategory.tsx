import { Upload } from "antd";
import React, { useContext, useState } from "react";
import VideoCard from "./videoCard";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { UploadProps, message } from "antd/lib";
import { RcFile, UploadChangeParam, UploadFile } from "antd/lib/upload";
import eduImage from "/public/edu.jpg";
import { StateContext } from "../contexts/generContext";
import { api } from "../App";
import { axiosInstance } from "@refinedev/simple-rest";
import { useNotification } from "@pankod/refine-core";

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
  const { open } = useNotification();
  const [state, dispatch] = useContext(StateContext);
  const uploadFile = async ({ onSuccess, file }: any) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const handleChange: any = (event: any) => {
    const formData = new FormData();
    if (event.file.percent == 100) {
      formData.append("video", event.file.originFileObj);
      setLoading(true);
      axiosInstance
        .post("http://35.222.121.103:3000/upload?videoType=education", formData)
        .then(({ data }) => {
          console.log(data?.videoName);
          let langArray = ["hi", "te", "ta"];
          langArray.map((lang) => {
            setTimeout(() => {
              axiosInstance
                .get(
                  `http://35.222.121.103:3000/lang/video/${data?.videoName}?videoType=education&lang=${lang}`
                )
                .then(({ data }) => {
                  setLoading(false);
                  props?.reFetch();
                });
            }, 500);
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
    // axiosInstance.post(api+"/upload?videoType=education",)
  };
  const imageLink = eduImage;

  return (
    <div className="video-card-container">
      <Upload
        name="avatar"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        customRequest={uploadFile}
      >
        {uploadButton}
      </Upload>
      {props?.a?.map((data: any, i: any) => {
        return (
          <VideoCard
            imageLink={imageLink}
            url={data?.url}
            title={data?.fileName}
          />
        );
      })}
    </div>
  );
};

export default EducationCategory;
