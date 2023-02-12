import { useState, useEffect } from "react";
import React from "react";

const Check = () => {
  const [check, setCheck] = useState("");
  useEffect(() => {
    setCheck(check + 1);
  }, []);
  return <div> {check} </div>;
};
export default Check;
