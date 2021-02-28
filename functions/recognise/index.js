const AWS = require("aws-sdk");

const MIN_CONFIDENCE = 70;
const REGION = "us-east-1";

const rekognition = new AWS.Rekognition({ region: REGION });

async function getLabels(imageBytes) {
  const detectLabels = () =>
    rekognition
      .detectLabels({
        Image: { Bytes: imageBytes },
      })
      .promise();

  let result = {
    name: "labels",
    labels: null,
    error: "",
  };

  try {
    result.labels = await detectLabels();
  } catch (e) {
    console.log("LABEL ERROR", e);
    result.error = e;
  }

  return result;
}

async function getFaces(imageBytes) {
  const detectFaces = () =>
    rekognition
      .detectFaces({
        Attributes: ["ALL"],
        Image: { Bytes: imageBytes },
      })
      .promise();

  const result = {
    name: "faces",
    faceDetails: null,
    error: "",
  };

  try {
    result.faceDetails = await detectFaces();
  } catch (e) {
    console.log("FACES ERROR: ", e);
    result.e = e;
  }

  return result;
}

async function getPPEDetails(imageBytes) {
  const detectPPE = () =>
    rekognition
      .detectProtectiveEquipment({
        Image: { Bytes: imageBytes },
      })
      .promise();

  const result = {
    name: "ppe",
    PPEDetails: null,
    error: "",
  };

  try {
    result.PPEDetails = await detectPPE();
  } catch (e) {
    console.log("PPE ERROR: ", e);
    result.error = e;
  }

  return result;
}

exports.recogniseHandler = async (event) => {
  const body = JSON.parse(event.body);
  const imageBytes = Buffer.from(body.image, "base64");

  const result = await Promise.all([
    getLabels(imageBytes),
    getFaces(imageBytes),
    getPPEDetails(imageBytes),
  ]);
  const res = result.flat();

  return respond(200, res);
};

function respond(statusCode, response) {
  return {
    statusCode,
    body: JSON.stringify(response),
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
  };
}
