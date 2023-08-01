import ReactDOM from "react-dom";
import React from "react";
import Button from "@mui/material/Button";
import { RealtimeRequestByUsername } from "@sitecore/sc-contenthub-webclient-sdk/dist/models/notifications/realtime-request-by-username";

export default function createExternalRoot(container) {
  const clickHandler = async (message) => {
    alert(`Welcome ${message} from Gautam and Tushar`);
  };

  return {
    render(context) {
      if (!context.config.message) return;

      ReactDOM.render(
        <Button
          variant="contained"
          disableElevation
          theme={context.theme}
          onClick={() => clickHandler(context.config.message)}
        >
          Click Me!
        </Button>,
        container
      );
    },
    unmount() {
      ReactDOM.unmountComponentAtNode(container);
    },
  };
}
