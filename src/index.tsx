import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import "./index.css";
import Maketra from "./Maketra";
import reportWebVitals from "./reportWebVitals";

const CssVariablesStyle = createGlobalStyle`
  :root {
    --color-focus: #00F;
    --color-border: #DDD;
    --color-icon: #BBB;
    --color-bg-drop-down: #000;
    --color-fg-drop-down: #FFF;
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
