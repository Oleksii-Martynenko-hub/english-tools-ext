import React from "react";
import { render } from "react-dom";

const Options = () => {
  return (
    <div>
      <div id="buttonDiv"></div>
      <div>
        <p>Choose a different background color!</p>
      </div>
    </div>
  );
};

export default Options;

render(<Options />, document.getElementById("options-root"));
