import type { RefineThemedLayoutV2HeaderProps } from "@refinedev/antd";
import { useGetIdentity } from "@refinedev/core";
import {
  Layout as AntdLayout,
  Avatar,
  Space,
  Switch,
  Tabs,
  Typography,
  theme,
} from "antd";
import "./index.css";
import React, { useContext, useEffect, useState } from "react";
import { ColorModeContext } from "../../contexts/color-mode";
import { ContactsOutlined, ReadOutlined } from "@ant-design/icons";
import { VideoList } from "../../pages/Main";
import { StateContext } from "../../contexts/generContext";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;
const { useToken } = theme;

type IUser = {
  id: number;
  name: string;
  avatar: string;
};

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = ({
  sticky,
}) => {
  const { token } = useToken();
  // const { data: user } = useGetIdentity<IUser>();
  const { mode, setMode } = useContext(ColorModeContext);

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0px 24px",
    height: "64px",
  };
  const [state, dispatch] = useContext(StateContext);

  useEffect(() => {
    let tabState = location?.pathname=="/video"
    dispatch({...state,tabRequired:tabState})
  },[]);

  if (sticky) {
    headerStyles.position = "sticky";
    headerStyles.top = 0;
    headerStyles.zIndex = 1;
  }
  const navigate = useNavigate();
  return (
    <>
      <AntdLayout.Header style={headerStyles}>
        <Space align="center" className="pointer">
          {/* <a href="/"> */}
            <img width={80} src="/powerPixelLogo.png" onClick={()=>navigate("/video")} />
          {/* </a> */}
        </Space>
        <Space className="heading pointer" onClick={()=>navigate("/video")}>Pixel Power</Space>
        <Space>
          <Switch
            checkedChildren="🌛"
            unCheckedChildren="🔆"
            onChange={() => setMode(mode === "light" ? "dark" : "light")}
            defaultChecked={mode === "dark"}
          />
        </Space>
      </AntdLayout.Header>
      {state?.tabRequired && (
        <Tabs
          tabPosition={"top"}
          defaultActiveKey="2"
          onTabClick={(e) => dispatch({ ...state, type: e })}
          items={[ReadOutlined, ContactsOutlined].map((Icon, i) => {
            const id = i == 0 ? "Education" : "Entertainment";
            return {
              key: id,
              label: `${id}`,
              children: "",
              icon: <Icon />,
            };
          })}
        />
      )}
    </>
  );
};
