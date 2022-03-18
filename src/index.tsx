import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import "./index.css";
import Maketra from "./Maketra";
import reportWebVitals from "./reportWebVitals";

const CssVariablesStyle = createGlobalStyle`
  :root {
    --radius-ui: 2px;
    --color-background: #FFF;
    --color-focus: #08F;
    --color-border: #0001;
    --color-icon: #BBB;
    --color-bg-drop-down: #000;
    --color-fg-drop-down: #FFF;
    --color-bg-drop-down-selected: #08F;
    --color-bg-drop-down-hover: #08F5;
    --color-bg-hover: #0001;
    --color-bg-selected: #08F3;
  }
`;

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <CssVariablesStyle />
      <Maketra />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
