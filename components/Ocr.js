import classes from "../styles/Ocr.module.css";
import React, { useState, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";

const Webcam = () => {
  const [cameraStream, setCameraStream] = useState(null);
  const [image, setImage] = useState(null);
  const [text, setText] = useState("capital of india is ");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [disable, setDisable] = useState(false);
  const [answer, setAnswer] = useState(null);

  // useEffect(() => {

  // }, []);
  const handleStart = () => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: "environment" } },
        });
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
      } catch (error) {
        console.error(error);
      }
    };

    startCamera();
    setDisable(true);
    // return () => {
    //   if (cameraStream) {
    //     const tracks = Array.from(cameraStream.getTracks());
    //     tracks.forEach((track) => track.stop());
    //   }
    // };
  };
  const handleStop = () => {
    const tracks = Array.from(cameraStream.getTracks());
    tracks.forEach((track) => track.stop());
    setDisable(false);
  };
  const handleCameraClick = async () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg").split(",")[1];
    setImage(imageData);

    const result = await Tesseract.recognize(
      `data:image/jpeg;base64,${imageData}`
    );
    console.log(result.data.text);
    console.log(result);
    setText(result.data.text);

    const tracks = Array.from(cameraStream.getTracks());
    tracks.forEach((track) => track.stop());
    setDisable(false);
  };

  const handleFileInput = async (event) => {
    setDisable(false);

    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const imageData = event.target.result.split(",")[1];
      setImage(imageData);

      const result = await Tesseract.recognize(
        `data:image/jpeg;base64,${imageData}`
      );
      console.log(result.data.text);
      console.log(result);
      setText(result.data.text);
    };

    reader.readAsDataURL(file);
  };
  const handleAnswer = async () => {
    try {
      const response = await fetch(
        "https://enthusiastic-hen-petticoat.cyclic.app//answer",
        {
          method: "POST",
          body: JSON.stringify({ text }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const resData = await response.json();
      console.log(resData);
      console.log(typeof resData);
      setAnswer(resData.generatedText);
      // setIsLoading(false);
      // fs.writeFileSync("../pages/api/files/files.json", resData);
    } catch (error) {
      console.error(error);
      // setIsLoading(false);
    }
  };

  return (
    <div className={classes.cover}>
      {disable && <video ref={videoRef} autoPlay />}
      <canvas
        ref={canvasRef}
        width={320}
        height={240}
        style={{ display: "none" }}
      />
      {image ? (
        <div className={`${classes.flex}`}>
          <img src={`data:image/jpeg;base64,${image}`} alt="Captured" />
          {text != "capital of india is " && <p>{text}</p>}
          <button onClick={() => setTimeout(handleAnswer, 2000)}>
            Check Answer
          </button>
          {answer && <p>{answer}</p>}
        </div>
      ) : (
        <div>
          <div className={classes.flex}>
            {!disable && <button onClick={handleStart}>Start camera</button>}{" "}
            {disable && <button onClick={handleStop}>Stop Camera</button>}{" "}
            {disable && <button onClick={handleCameraClick}>Capture</button>}
          </div>
          <div>
            <input
              className={classes.file}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Webcam;
