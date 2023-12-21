import { useContext, useEffect } from "react";
import { StateContext } from "../../contexts/generContext";
import "./style.css";
import { RcFile } from "antd/lib/upload";
import EducationCategory from "../../components/EducationCategory";
import { useList } from "@refinedev/core";
import LoadingSpinner from "../../components/loadingSpinner";

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

export const VideoList: React.FC<any> = () => {
  const [state, dispatch] = useContext(StateContext);
  let a = [1, 2, 3, 4, 5, 6];
  useEffect(() => {
    let tabState = location?.pathname == "/video";
    dispatch({ ...state, tabRequired: tabState });
  }, []);

  const { data: res, isLoading,refetch }: any = useList({
    resource: "videos/Input_Video_Folder?videoType=education",
  });
  const videoData = res?.data?.videos;
  console.log(videoData);
  return (
    <div id="main">
      {isLoading ? (
        <LoadingSpinner />
      ) : state?.type == "Education" ? (
        <EducationCategory reFetch={refetch} a={videoData} />
      ) : (
        <></>
      )}
    </div>
  );
};
