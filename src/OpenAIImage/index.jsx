import ReactDOM from "react-dom";
import React, { useState, useEffect } from "react";
import { Configuration, OpenAIApi } from "openai";
import { Button } from "@mui/material/Button";
import "../OpenAIImage/style.css";
import { Checkbox } from "@mui/material";
import "@sitecore/sc-contenthub-webclient-sdk/dist/clients/upload-client";
import URI from "urijs"
import {HttpUploadSource} from '@sitecore/sc-contenthub-webclient-sdk/dist/models/upload/http-upload-source';
import { UploadRequest } from '@sitecore/sc-contenthub-webclient-sdk/dist/models/upload/upload-request';

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
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState(
    "Search Bears with Paint Brushes the Starry Night, painted by Vincent Van Gogh.."
  );
  const configuration = new Configuration({
    apiKey: context.config.openAIKey,
  });
  console.log("configuration.apiKey");
  console.log(configuration.apiKey);  
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
    setResult(res.data.data.map((i) => i.url));
   // setResult("https://cdn.pixabay.com/photo/2018/03/22/02/37/email-3249062_1280.png");
    console.log("OPEN AI Image URL");
    console.log(result);
  };

  const uploadImageHandler = async () => {
  
    console.log("uploadImageHandler - ",result);
    // const imgUrl = new URI("https://cdn.pixabay.com/photo/2018/03/22/02/37/email-3249062_1280.png"); 
    // const uploadSource = new HttpUploadSource(imgUrl,"email-3249062_1280");
    // const request = new UploadRequest(
    //   uploadSource,
    //   "AssetUploadConfiguration",
    //   "NewAsset"
    // );
    // const result = await context.client.uploads.uploadAsync(request);
  };

  return (
    <div className="app-main">
      {loading ? (
        <>
          <h2>Generating..Please Wait..</h2>
          <div class="lds-ripple">
            <div></div>
            <div></div>
          </div>
        </>
      ) : (
        <>
          <div className="col-12" theme={context.theme}>
            <h2 theme={context.theme}>Generate an Image using Open AI API</h2>
            <textarea
              theme={context.theme}
              className="app-input"
              placeholder={placeholder}
              onChange={(e) => setPrompt(e.target.value)}
              rows="10"
              cols="40"
            />
            <button id="btnGenerateImage" onClick={generateImage}>
              Generate an Image
            </button>
            <button
              id="btnuploadImage"
              onClick={() => uploadImageHandler()}
            >
              Upload Image
            </button>
          </div>
          <div className="col-12">
            {result.length > 0 ? (
              result.map((i) => (
                <img className="result-image" src={i} alt="result" />
              ))
            ) : (
              <></>
            )}
          </div>
        </>
      )}
    </div>
  );
}
