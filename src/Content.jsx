import React, { useEffect, useState } from "react";
import { render } from "react-dom";

const Page = () => {
  const [text, setText] = useState("");
  const [isBtnVisible, setIsBtnVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [positionSelected, setPositionSelected] = useState({
    start: 0,
    end: 0,
  });

  useEffect(() => {
    console.log("load component");

    const handleMouseDown = (e) =>
      setPositionSelected((prev) => ({ ...prev, start: e.pageY }));
    document.addEventListener("mousedown", handleMouseDown);

    return document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  useEffect(() => {
    const handleMouseUp = (e) => {
      console.log("mouseup");
      setPositionSelected((prev) => ({ ...prev, end: e.pageY }));
      setPosition({ x: e.pageX, y: e.pageY });
      const string = getSelectedText();
      console.log("🚀 ~ document.addEventListener ~ string", string.split(" "));
      setText(string);
      setIsBtnVisible(true);
    };
    document.addEventListener("mouseup", handleMouseUp);

    return document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  useEffect(() => {
    console.log({
      isBtnVisible,
      position,
      positionSelected,
      text,
    });
  }, [isBtnVisible]);

  function getSelectedText() {
    if (window.getSelection) {
      // all browsers, except IE before version 9
      var range = window.getSelection();
      setText(range.toString());
    } else {
      if (document.selection.createRange) {
        // Internet Explorer
        var range = document.selection.createRange();
        setText(range.toString());
      }
    }
  }

  const handleOnClickBtn = () => {
    setIsBtnVisible(false);
  };

  return (
    <div>
      {isBtnVisible && (
        <button
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            border: "1px solid blue",
            background: "#eee",
            position: "absolute",
            zIndex: "100",
            left: position.x + "px",
            top:
              (positionSelected.end >= positionSelected.start
                ? positionSelected.end + 25
                : positionSelected.start - 25) + "px",
          }}
          onClick={handleOnClickBtn}
        >
          {text}
        </button>
      )}
    </div>
  );
};

export default Page;

render(<Page />, document.getElementById("page-root"));
