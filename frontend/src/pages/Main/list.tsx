import { useContext, useEffect } from "react";
import { StateContext } from "../../contexts/generContext";
import "./style.css";
import { RcFile } from "antd/lib/upload";
import EducationCategory from "../../components/EducationCategory";

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

  return (
    <div id="main">
      {state?.type == "Education" ? <EducationCategory a={a} /> : <></>}
    </div>
  );
};
