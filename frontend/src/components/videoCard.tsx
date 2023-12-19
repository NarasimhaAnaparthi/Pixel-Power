import React from "react";
import { useNavigate } from "react-router-dom";

const VideoCard = (props: any) => {
  const navigate = useNavigate();
  return (
    <div className="video-card pointer" onClick={(e) => {navigate("/video/show")}}>
      <div>
        <img src={props?.imageLink} />
      </div>
      <div>
        <h4>{props?.title + props?.i}</h4>
      </div>
    </div>
  );
};

export default VideoCard;
