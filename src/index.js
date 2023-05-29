import React from "./react";
import ReactDOM from "./react-dom/client";
const root = ReactDOM.createRoot(document.getElementById("root"));

const element = (
  <div>
    <span style={{ color: "red" }}>123</span>
  </div>
);

console.log(element);

root.render(element);
