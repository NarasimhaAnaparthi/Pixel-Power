import { createContext, useState } from "react";

export const StateContext = createContext<any>({});

const StateProvider: React.FC<any> = (props) => {
  let [state, dispatch] = useState({
    type: "Education",
    tabRequired:false
  });

  return (
    <StateContext.Provider value={[state, dispatch]}>
      {props.children}
    </StateContext.Provider>
  );
};

export default StateProvider;
