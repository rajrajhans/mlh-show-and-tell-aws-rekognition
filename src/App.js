import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect } from "react";
import FileUpload from "./components/FileUpload";
import Results from "./components/Results";

function App() {
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (image) {
      makeRequest(image, setIsLoading, setResult);
    }
  }, [image]);

  return (
    <div className="container">
      <div className="header">
        ImageAnalyzer 👀
        <hr />
      </div>

      {isLoading ? (
        <div className={"loading"}>Loading</div>
      ) : (
        <>
          <FileUpload
            image={image}
            setImage={setImage}
            setIsLoading={setIsLoading}
          />

          <hr />

          {result ? <Results result={result} image={image} /> : null}
        </>
      )}
    </div>
  );
}

export default App;

async function makeRequest(imageBytes, setIsLoading, setResult) {
  setIsLoading(true);
  const url =
    "https://t6oil6mf9e.execute-api.us-east-1.amazonaws.com/prod/recognise"; // Use the URL you get from API Gateway here

  const body = {
    image: imageBytes,
  };
  console.log("making req");
  const result = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
  }).then((data) => data.json());

  console.log(result);
  setResult(result);
  setIsLoading(false);
}
