import React from "react";
import { Spin } from "antd";

const spinnerStyles: React.CSSProperties = {
  width: "100%",
  height: "100vh",
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  marginTop:"25px"
};
const LoadingSpinner: React.FC = () => {
  return (
    <div style={spinnerStyles}>
      <Spin tip="Loading" size="large"></Spin>
    </div>
  );
};

export default LoadingSpinner;
