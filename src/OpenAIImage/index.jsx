import ReactDOM from "react-dom";
import { v4 as uuidv4 } from "uuid";
import React, { useState, useEffect } from "react";
import { Configuration, OpenAIApi } from "openai";
import Button from "@mui/material/Button";
import "../OpenAIImage/style.css";
import { Alert, Checkbox } from "@mui/material";
import "@sitecore/sc-contenthub-webclient-sdk/dist/clients/upload-client";
import URI from "urijs";
import { HttpUploadSource } from "@sitecore/sc-contenthub-webclient-sdk/dist/models/upload/http-upload-source";
import { UploadRequest } from "@sitecore/sc-contenthub-webclient-sdk/dist/models/upload/upload-request";

export default function OpenAIImage(container) {
  return {
    render(context) {
      ReactDOM.render(<GenerateAIImage context={context} />, container);
    },
    unmount() {
      ReactDOM.unmountComponentAtNode(container);
    },
  };
}

function GenerateAIImage({ context }) {
  const noOfImg = parseInt(context.config.numOfImage);
  const imageSize = context.config.imageSize;
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setupLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState("Search with any keyword..");
  const configuration = new Configuration({
    apiKey: context.config.openAIKey,
  });

  const openai = new OpenAIApi(configuration);

  const generateImage = async () => {
    setPlaceholder(`Search ${prompt}..`);
    setLoading(true);
    const res = await openai.createImage({
      prompt: prompt,
      n: noOfImg,
      size: imageSize,
    });

    setLoading(false);
    setResult(res.data.data[0].url);
  };

  const uploadImageHandler = () => {
    return new Promise(async (resolve, reject) => {
      try {
        setupLoading(true);
        const url = await result; // Some async operation that provides a result
        console.log("uploadImageHandler - ", url);

        const imgUrl = new URI("https://cors-anywhere.herokuapp.com/" + url);
        const guid = uuidv4();
        const uploadSource = new HttpUploadSource(imgUrl, `${guid}.png`);
        const request = new UploadRequest(
          uploadSource,
          "AssetUploadConfiguration",
          "NewAsset"
        );

        const uploadResult = await context.client.uploads.uploadAsync(request);
        setupLoading(false);
        resolve(uploadResult);
      } catch (error) {
        reject(error);
      }
    });
  };

  return (
    <div className="app-main">
      {loading ? (
        <>
          <h2>Generating image Please Wait..</h2>
          <img src="https://ps-ch-playground.sitecoresandbox.cloud/api/public/content/a91d363ffbbb4cdd8bc060d9b8bf5ca2?v=da0c16fd"></img>
        </>
      ) : uploading ? (
        <>
          <h2>Uploading into Content Hub Please Wait..</h2>
          <img src="https://ps-ch-playground.sitecoresandbox.cloud/api/public/content/e3cbf10d70e44f0aaed7aca69a97e7cb?v=19f722d2"></img>
        </>
      ) : (
        <>
          <div className="col-12" theme={context.theme}>
            <h2 theme={context.theme}>Generate an Image using Open AI</h2>
            <textarea
              theme={context.theme}
              className="app-input"
              placeholder={placeholder}
              onChange={(e) => setPrompt(e.target.value)}
              rows="10"
              cols="40"
            />
            <Button
              variant="contained"
              disableElevation
              onClick={() => generateImage()}
              style={{
                backgroundColor: "green",
                marginRight: "30px",
                marginBottom: "64px",
              }}
            >
              Generate Image
            </Button>
            <Button
              variant="contained"
              disableElevation
              onClick={() => uploadImageHandler()}
              style={{
                marginBottom: "64px",
              }}
            >
              Upload Image
            </Button>
          </div>
          <div className="col-12">
            {result != "" ? (
              // result.map((i) => (
              //   <img className="result-image" src={i} alt="result" />
              // ))
              <img className="result-image" src={result} alt="result" />
            ) : (
              <></>
            )}
          </div>
        </>
      )}
    </div>
  );
}
