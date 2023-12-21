import { Select } from "antd";
import React, { useState, useEffect, useRef, useContext } from "react";
import { StateContext } from "../../contexts/generContext";
import { useParams } from "react-router-dom";
import { useList } from "@refinedev/core";
import LoadingSpinner from "../../components/loadingSpinner";

const VideoPlayer = ({
  subtitles,
  videoUrl,
  transcript,
  setTransValue,
}: any) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [previous, setPrevious] = useState("");
  const [startTranscation, setStartTranscation] = useState(false);
  const [reloadTimestamp, setReloadTimestamp] = useState(0);

  const handleTimeUpdate = (event: any) => {
    setCurrentTime(event.target.currentTime * 1000); // Convert seconds to milliseconds
  };
  const [state, dispatch] = useContext(StateContext);

  const [text, setText] = useState("");
  useEffect(() => {
    const videoElement = document.getElementById("video");
    let tabState = location?.pathname == "/video";
    dispatch({ ...state, tabRequired: tabState });
    if (videoElement) {
      videoElement.addEventListener("timeupdate", handleTimeUpdate);
      return () =>
        videoElement.removeEventListener("timeupdate", handleTimeUpdate);
    }
  }, []);

  const currentSubtitle = subtitles.find(
    (subtitle: any) =>
      currentTime >= subtitle.start && currentTime <= subtitle.end
  );

  useEffect(() => {
    if (previous !== currentSubtitle?.text) {
      currentSubtitle?.text && setText(text + currentSubtitle?.text + ".");
      setPrevious(currentSubtitle?.text);
    }
  }, [currentSubtitle]);

  const videoRef: any = useRef();

  useEffect(() => {
    setReloadTimestamp(videoRef.current.currentTime * 1000);
    videoRef.current?.load();
  }, [videoUrl]);

  useEffect(() => {
    // Set the video's currentTime after reloading
    if (videoRef.current) {
      videoRef.current.currentTime = reloadTimestamp / 1000; // Convert to seconds
      videoRef.current.play();
    }
  }, [reloadTimestamp]);

  return (
    <div>
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1 }}>
          <video
            id="video"
            ref={videoRef}
            controls
            onPlay={(e) => setStartTranscation(true)}
            style={{ position: "absolute" }}
          >
            {/* Add your video source here */}
            <source src={videoUrl} />
            {/* {generateVTTTrack(subtitles)} */}
          </video>
          <Subtitle videoUrl={videoUrl} currentSubtitle={currentSubtitle} />
        </div>
        <div style={{ flex: 1 }}>
          <Transcription
            transcript={transcript}
            startTranscation={startTranscation}
            setTransValue={setTransValue}
          />
        </div>
      </div>
    </div>
  );
};

// const formatTime = (milliseconds: any) => {
//   const date = new Date(milliseconds);
//   return date.toISOString().substr(11, 8);
// };

// const generateVTTTrack = (subtitles: any) => {
// const vttContent =
//   "WEBVTT\n\n" +
//   subtitles
//     .map(
//       (subtitle: any, index: any) =>
//         `${formatTime(subtitle.start)} --> ${formatTime(subtitle.end)}\n${
//           subtitle.text
//         }\n\n`
//     )
//     .join("");

//   const blob = new Blob([vttContent], { type: "text/vtt" });
//   const url = URL.createObjectURL(blob);
//   console.log(url);
//   return (
//     // <track label="English" kind="subtitles" srcLang="en" src={url} default />
//     <track src={url} kind="subtitles" srcLang="en" label="English" />
//   );
// };

const Subtitle = ({ videoUrl, currentSubtitle }: any) => {
  return (
    <div>
      {videoUrl && currentSubtitle && (
        <p className="subtitles">{currentSubtitle.text}</p>
      )}
    </div>
  );
};

const Transcription = ({
  transcript,
  startTranscation,
  transValue,
  setTransValue,
}: any) => {
  return (
    <div>
      <h2>Transcription</h2>
      <Select
        defaultValue={transValue}
        style={{ width: 120, marginBottom: "20px" }}
        onChange={(e) => setTransValue(e)}
        options={[
          { value: "telugu", label: "Telugu" },
          { value: "hindi", label: "Hindi" },
          { value: "tamil", label: "Tamil" },
          { value: "", label: "Select" },
        ]}
      />
      {startTranscation && <p style={{ padding: "10px" }}>{transcript}</p>}
    </div>
  );
};

export const VideoShow: React.FC<any> = () => {
  const { id } = useParams();
  const [value, setValue] = useState("original");
  const [transValue, setTransValue] = useState("");
  const [URL, setURL] = useState({
    original: localStorage?.getItem("originalURL"),
    telugu: "",
    tamil: "",
    hindi: "",
  });

  const [langTranscripts, setLangTranscripts] = useState({
    telugu: "",
    hindi: "",
    tamil: "",
  });

  const [videoUrl, setVideoUrl] = useState(URL?.original);
  const [transcript, setTranscripts] = useState("");

  useEffect(() => {
    let url =
      value == "original"
        ? URL?.original
        : value == "telugu"
        ? URL?.telugu
        : value == "hindi"
        ? URL?.hindi
        : value == "tamil"
        ? URL?.tamil
        : "";
    setVideoUrl(url);
  }, [value]);

  useEffect(() => {
    let trans =
      value == ""
        ? ""
        : transValue == "telugu"
        ? langTranscripts?.telugu
        : transValue == "hindi"
        ? langTranscripts?.hindi
        : transValue == "tamil"
        ? langTranscripts?.tamil
        : "";
		console.log(trans,"trans")
    setTranscripts(trans);
  }, [transValue]);

  const [subtitle, setSubTitle] = useState<any>([]);

  const { data, isLoading }: any = useList({
    resource: `convertedvideos?video=${id}.mp4`,
  });
  const videoData: any = data?.data?.videos;

  useEffect(() => {
    if (videoData) {
      let url = {
        telugu: "",
        hindi: "",
        tamil: "",
      };
      let transcriptions = {
        telugu: "",
        hindi: "",
        tamil: "",
      };
      setSubTitle([...videoData[0].data.json_result]);
      videoData.map((data: any) => {
        const keys = Object.keys(data);

        if (keys.includes("HindiUrl")) {
          url.hindi = data?.HindiUrl;
          transcriptions.hindi = data?.data?.translated_text;
        }
        if (keys.includes("TeluguUrl")) {
          url.telugu = data?.TeluguUrl;
          transcriptions.telugu = data?.data?.translated_text;
        }
        if (keys.includes("TamilUrl")) {
          transcriptions.tamil = data?.data?.translated_text;
          url.tamil = data?.TamilUrl;
        }
      });
      setLangTranscripts({
        ...langTranscripts,
        ...transcriptions,
      });
      setURL({ ...URL, ...url });
    }
  }, [videoData]);
  console.log(transcript);
  //   console.log(subtitle);
  return (
    <div>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <h1>Video Transcript and Subtitles</h1>
          <Select
            defaultValue="original"
            style={{ width: 120, marginBottom: "20px" }}
            onChange={(e) => setValue(e)}
            options={[
              { value: "telugu", label: "Telugu" },
              { value: "hindi", label: "Hindi" },
              { value: "tamil", label: "Tamil" },
              { value: "original", label: "Original" },
            ]}
          />
          <VideoPlayer
            subtitles={subtitle}
            videoUrl={videoUrl}
            transcript={transcript}
            transValue={transValue}
            setTransValue={setTransValue}
          />
        </>
      )}
    </div>
  );
};

export default VideoShow;
