import { Select } from "antd";
import React, { useState, useEffect, useRef, useContext } from "react";
import { StateContext } from "../../contexts/generContext";

const VideoPlayer = ({ subtitles, videoUrl, transcrip }: any) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [previous, setPrevious] = useState("");
  const [startTranscation, setStartTranscation] = useState(false);
  const [reloadTimestamp, setReloadTimestamp] = useState(0);

  // const [blobUrl, setBlobUrl] = useState("");
  // useEffect(() => {
  //   const vttContent =
  //     "WEBVTT\n\n" +
  //     subtitles
  //       .map(
  //         (subtitle: any, index: any) =>
  //           `${formatTime(subtitle.start)} --> ${formatTime(subtitle.end)}\n${
  //             subtitle.text
  //           }\n\n`
  //       )
  //       .join("");

  //   const blob = new Blob([vttContent], { type: "text/vtt" });
  //   const url: any = URL.createObjectURL(blob);

  //   setBlobUrl(url);
  //   // Cleanup Blob URL when component unmounts
  //   return () => URL.revokeObjectURL(url);
  // }, []);
  // console.log(blobUrl)

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
	  setPrevious(currentSubtitle?.text)
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
            transcript={text}
            startTranscation={startTranscation}
          />
        </div>
        <div style={{ flex: 1 }}>
          <>keywords</>
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

const Transcription = ({ transcript, startTranscation }: any) => {
  return (
    <div>
      <h2>Transcription</h2>
      {startTranscation && <p style={{ padding: "10px" }}>{transcript}</p>}
    </div>
  );
};

export const VideoShow: React.FC<any> = () => {
  const [value, setValue] = useState("original");

  let original =
    "https://storage.googleapis.com/encode_project_pixelpower/entertainment/AI_1.mp4";
  let telugu =
    "https://storage.googleapis.com/encode_project_pixelpower/Output_Video_Folder/Translated_video_Telugu.mp4";
  let tamil =
    "https://storage.googleapis.com/encode_project_pixelpower/Output_Video_Folder/Translated_video_Tamil.mp4";
  let hindi =
    "https://storage.googleapis.com/encode_project_pixelpower/Output_Video_Folder/Translated_video_Hindi.mp4";

  let [videoUrl, setVideoUrl] = useState(original);

  useEffect(() => {
    console.log("called");
    videoUrl =
      value == "original"
        ? original
        : value == "telugu"
        ? telugu
        : value == "hindi"
        ? hindi
        : value == "tamil"
        ? tamil
        : "";
    setVideoUrl(videoUrl);
  }, [value]);

  const subtitles = [
    {
      start: 0,
      end: 2000,
      text: "This is the first two seconds 1",
    },
    {
      start: 2001,
      end: 4000,
      text: "This is the second two seconds",
    },
    {
      start: 4001,
      end: 6000,
      text: "This is the first two seconds",
    },
    {
      start: 6001,
      end: 8000,
      text: "This is the second two seconds",
    },
    {
      start: 8001,
      end: 10000,
      text: "This is the first two seconds",
    },
    {
      start: 10001,
      end: 12000,
      text: "This is the second two seconds",
    },
    {
      start: 12001,
      end: 14000,
      text: "This is the first two seconds",
    },
    {
      start: 14001,
      end: 16000,
      text: "This is the second two seconds",
    },
    {
      start: 16001,
      end: 18000,
      text: "This is the first two seconds",
    },
    {
      start: 18001,
      end: 20000,
      text: "This is the second two seconds",
    },
    // Add more subtitle objects as needed
  ];

  const transcript = "This is the complete transcription of the video.";

  return (
    <div>
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
      <VideoPlayer subtitles={subtitles} videoUrl={videoUrl} />
    </div>
  );
};

export default VideoShow;
