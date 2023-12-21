import React from "react";
import { useNavigate } from "react-router-dom";

const VideoCard = (props: any) => {
  const navigate = useNavigate();
  return (
    <div
      className="video-card pointer"
      onClick={(e) => {
        localStorage.setItem("originalURL", props?.url);
        navigate(`/video/show/${props?.title.split(".")[0]}`);
      }}
    >
      <div>
        <img src={props?.imageLink} />
      </div>
      <div>
        <h4>{props?.title}</h4>
      </div>
    </div>
  );
};

export default VideoCard;
