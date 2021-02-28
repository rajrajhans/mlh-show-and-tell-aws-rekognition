import React, { useState, useEffect } from "react";

const Results = ({ result, image }) => {
  const labels = result[0]["labels"]["Labels"];
  labels.sort((a, b) => b.Instances.length - a.Instances.length);

  const faces = result[1]["faceDetails"]["FaceDetails"];
  const ppeDetails = result[2]["PPEDetails"]["Persons"];

  let labelCanvasses = [];
  let PPECanvasses = [];
  let faceCanvasses = [];

  useEffect(() => {
    labelCanvasses.map((cnv) => {
      drawCanvas(cnv.id, image, cnv.bb);
    });

    PPECanvasses.map((cnv) => {
      drawCanvas(cnv.id, image, cnv.bb);
    });

    faceCanvasses.map((cnv) => {
      drawCanvas(cnv.id, image, cnv.bb);
    });
  }, []);

  function updateLabelCanvasses(cnv) {
    labelCanvasses = [...labelCanvasses, cnv];
  }

  function updatePPECanvasses(cnv) {
    PPECanvasses = [...PPECanvasses, cnv];
  }

  function updateFaceCanvasses(cnv) {
    faceCanvasses = [...faceCanvasses, cnv];
  }

  return (
    <>
      <div className={"image-container"}>
        <div className="og-image-label">
          <strong>Original Image:</strong>
        </div>
        <img src={`data:image/png;base64, ${image}`} alt={"uploaded image"} />
      </div>

      <h1>Object Detection</h1>
      <div className="labels-container">
        {labels.map((labelObject) => (
          <DisplayLabel
            labelObject={labelObject}
            updateCanvasses={updateLabelCanvasses}
          />
        ))}
      </div>

      <h1>PPE Detection</h1>
      <div className="ppe-container">
        {ppeDetails.map((person) => (
          <DisplayPersonPPE
            person={person}
            updateCanvasses={updatePPECanvasses}
          />
        ))}
      </div>

      <h1>Face Analysis</h1>
      <div className="faces-container">
        {faces.map((face) => (
          <DisplayFace face={face} updateCanvasses={updateFaceCanvasses} />
        ))}
      </div>
    </>
  );
};

export default Results;

const DisplayLabel = ({ labelObject, updateCanvasses }) => {
  return (
    <div className={"label-obj-container"}>
      <div className="label-name">
        Object Name: <strong>{labelObject.Name}</strong>
      </div>
      <div className="label-confidence">
        Confidence:{" "}
        <strong>
          {(Math.round(labelObject.Confidence * 100) / 100).toFixed(2)} %
        </strong>
      </div>

      {labelObject.Instances.length ? (
        <>
          {" "}
          <div>Instances:</div>
          <div className="label-instances">
            {labelObject.Instances.map((instance) => {
              const canvasID = Math.random().toString(36).substring(7);
              const cnv = {
                id: canvasID,
                bb: instance.BoundingBox,
              };
              updateCanvasses(cnv);
              return (
                <div className={"label-instance"}>
                  <canvas id={canvasID} />
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
};

function drawCanvas(canvasID, imageBytes, BoundingBox) {
  const canvas = document.getElementById(canvasID);

  if (canvas) {
    const ctx = canvas.getContext("2d");

    const base64Image = `data:image/png;base64, ${imageBytes}`;
    const img = new Image();

    img.onload = function () {
      const sWidth = img.width * BoundingBox.Width;
      const sHeight = img.height * BoundingBox.Height;
      const sx = BoundingBox.Left * img.width;
      const sy = BoundingBox.Top * img.height;
      const o = img.width * BoundingBox.Width;
      const a = img.height * BoundingBox.Height;
      const rWidth = (300 * o) / a;
      const rHeight = 300;
      canvas.width = rWidth + 50;
      canvas.height = rHeight + 20;

      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, rWidth, rHeight);
    };
    img.src = base64Image;
  }
}

const DisplayPersonPPE = ({ person, updateCanvasses }) => {
  const canvasID = Math.random().toString(36).substring(7);
  const cnv = {
    id: canvasID,
    bb: person.BoundingBox,
  };
  updateCanvasses(cnv);

  return (
    <div className={"ppe-person-container"}>
      <div className="ppe-person-id">
        Person ID: <strong>{person.Id}</strong>
      </div>

      <div className="ppe-person-confidence">
        Confidence:
        <strong>
          {" "}
          {(Math.round(person.Confidence * 100) / 100).toFixed(2)} %
        </strong>
      </div>

      <div className="ppe-person-image">Person Image: </div>

      <div className={"label-instance"}>
        <canvas id={canvasID} />
      </div>

      <div className="ppe-bodyparts">
        {person.BodyParts.map((bodyPart) => (
          <>
            <div className="ppe-bodypart">
              <div>
                Body Part: <b>{bodyPart.Name}</b>
              </div>
              {bodyPart.EquipmentDetections.length ? (
                <>
                  <div className="ppe-equipment">
                    <div>
                      PPE Detected: {bodyPart.EquipmentDetections[0].Type}
                    </div>

                    <div>
                      The {bodyPart.EquipmentDetections[0].Type}{" "}
                      {bodyPart.EquipmentDetections[0].CoversBodyPart.Value
                        ? " covers "
                        : ` does not cover `}
                      the {bodyPart.Name}
                    </div>
                  </div>
                </>
              ) : (
                <div>No protective cover present for this body part</div>
              )}
            </div>
          </>
        ))}
      </div>
    </div>
  );
};

const DisplayFace = ({ face, updateCanvasses }) => {
  const floatFix = (num) => (Math.round(num * 100) / 100).toFixed(2);

  const canvasID = Math.random().toString(36).substring(7);
  const cnv = {
    id: canvasID,
    bb: face.BoundingBox,
  };
  updateCanvasses(cnv);

  return (
    <div className={"face-container"}>
      <div className={"label-instance face-instance"}>
        <canvas id={canvasID} />
      </div>

      <table>
        <tr>
          <th>Attribute</th>
          <th>Value</th>
          <th>Confidence</th>
        </tr>

        <tr>
          <td>Gender</td>
          <td>{face.Gender.Value}</td>
          <td>{floatFix(face.Gender.Confidence)}%</td>
        </tr>

        <tr>
          <td>Age</td>
          <td>
            {face.AgeRange.Low}-{face.AgeRange.High}
          </td>
          <td>{floatFix(face.Smile.Confidence)}%</td>
        </tr>

        <tr>
          <td>Emotion</td>
          <td>{face.Emotions[0].Type}</td>
          <td>{floatFix(face.Emotions[0].Confidence)}%</td>
        </tr>

        <tr>
          <td>Smile</td>
          <td>{face.Smile.Value ? "Present" : "No"}</td>
          <td>{floatFix(face.Smile.Confidence)}%</td>
        </tr>

        <tr>
          <td>Eyeglasses</td>
          <td>{face.Eyeglasses.Value ? "Present" : "No"}</td>
          <td>{floatFix(face.Eyeglasses.Confidence)}%</td>
        </tr>

        <tr>
          <td>Beard</td>
          <td>{face.Beard.Value ? "Present" : "No"}</td>
          <td>{floatFix(face.Beard.Confidence)}%</td>
        </tr>

        <tr>
          <td>Are eyes open?</td>
          <td>{face.EyesOpen.Value ? "Yes" : "No"}</td>
          <td>{floatFix(face.EyesOpen.Confidence)}%</td>
        </tr>

        <tr>
          <td>Is mouth open?</td>
          <td>{face.MouthOpen.Value ? "Yes" : "No"}</td>
          <td>{floatFix(face.MouthOpen.Confidence)}%</td>
        </tr>

        <tr>
          <td>Roll</td>
          <td>{floatFix(face.Pose.Roll)}°</td>
          <td>{floatFix(face.MouthOpen.Confidence)}%</td>
        </tr>

        <tr>
          <td>Yaw</td>
          <td>{floatFix(face.Pose.Yaw)}°</td>
          <td>{floatFix(face.MouthOpen.Confidence)}%</td>
        </tr>

        <tr>
          <td>Pitch</td>
          <td>{floatFix(face.Pose.Pitch)}°</td>
          <td>{floatFix(face.MouthOpen.Confidence)}%</td>
        </tr>

        <tr>
          <td>Brightness</td>
          <td>{floatFix(face.Quality.Brightness)}</td>
          <td>{floatFix(face.Confidence)}%</td>
        </tr>

        <tr>
          <td>Sharpness</td>
          <td>{floatFix(face.Quality.Sharpness)}</td>
          <td>{floatFix(face.Confidence)}%</td>
        </tr>
      </table>
    </div>
  );
};
