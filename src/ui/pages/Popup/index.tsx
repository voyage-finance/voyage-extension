import React from "react";
import ReactDOM from "react-dom";
import Popup from "./Popup";
import "./index.css";
import { initWeb3 } from "../../web3/init";

async function bootstrap() {
  // set up a connection to background script
  initWeb3();
  ReactDOM.render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>,
    document.getElementById('root')
  );
}

bootstrap();
