import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Configuration, OpenAIApi } from "openai";
import URI from "urijs";
import Button from "@mui/material/Button";
import "../DallEImage/DallEImage.css"
import { HttpUploadSource } from "@sitecore/sc-contenthub-webclient-sdk/dist/models/upload/http-upload-source";
import { UploadRequest } from "@sitecore/sc-contenthub-webclient-sdk/dist/models/upload/upload-request";

export default function DallEImage(container) {
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
  const configuration = new Configuration({
    apiKey: context.config.openAIKey,
  });

  const openai = new OpenAIApi(configuration);
  const [publicUrls, setPublicUrls] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setupLoading] = useState(false);

  const generateImage = async () => {
    try {
      const res = await openai.createImage({
        prompt: prompt,
        n: parseInt(context.config.numOfImage),
        size: context.config.imageSize,
      });

      const imageUrls = res.data.data.map((item) => item.url);
      setPublicUrls(imageUrls);
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  const handleCheckboxChange = (imageUrl) => {
    if (selectedImages.includes(imageUrl)) {
      setSelectedImages((prevSelected) =>
        prevSelected.filter((url) => url !== imageUrl)
      );
    } else {
      setSelectedImages((prevSelected) => [...prevSelected, imageUrl]);
    }
  };
  const uploadSelectedImages = async () => {
    console.log("Selected Images:", selectedImages);

    // Create an array to store all the UploadRequest objects
    const uploadRequests = selectedImages.map((imageUrl) => {
      const imgUrl = new URI(imageUrl);
      var imageName = imageUrl.match(/\w*(?=.\w+$)/);
      var imageext = imageUrl.split(/[#?]/)[0].split('.').pop().trim();    
      const uploadSource = new HttpUploadSource(imgUrl, imageName + '.' + imageext);
      return new UploadRequest(
        uploadSource,
        "AssetUploadConfiguration",
        "NewAsset"
      );
    });

    try {
      // Assuming that `context.client.uploads.uploadAsync` is an async function,
      // you can use `Promise.all` to upload all the selected images concurrently
      const uploadResults = await Promise.all(
        uploadRequests.map((request) =>
          context.client.uploads.uploadAsync(request)
        )
      );
      // Log the upload results
      console.log("Upload Results:", uploadResults);
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };

  return (
    <div className="create-container">
      <div className="create-image-container">
        <h2>Generate an Image using Open AI API</h2>

        <textarea
          className="app-input"
          placeholder="Search Bears with Paint Brushes the Starry Night, painted by Vincent Van Gogh.."
          onChange={(e) => setPrompt(e.target.value)}
          rows="10"
          cols="40"
        />
      </div>
      <div className="image-operation-container">
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
          Generate an Image
        </Button>
        <Button
          variant="contained"
          disableElevation
          onClick={() => uploadSelectedImages()}
          style={{
            marginBottom: "64px",
          }}
        >
          Upload Image
        </Button>
      </div>
      <div className="image-list-container">
        {publicUrls.length > 0 ? (
          publicUrls.map((imageUrl, index) => (
            <div key={index} className="image-box-main">
              <label className="image-box-chk-lable">
                <input
                  type="checkbox"
                  onChange={() => handleCheckboxChange(imageUrl)}
                  checked={selectedImages.includes(imageUrl)}
                />
                Image {index + 1}
              </label>
              <img
                className="image-box"
                src={imageUrl}
                alt={`Image${index + 1}`}
              />
            </div>
          ))
        ) : (
          <h1>Loading...</h1>
        )}
      </div>
    </div>
  );
}
