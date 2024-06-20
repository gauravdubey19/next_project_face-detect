"use client";

import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import Image from "next/image";
import UploadImage from "./UploadImage";

interface FaceApiStatus {
  modelsLoad: boolean;
  detecting: boolean;
  faceDetected: boolean;
}

const FaceRecognize: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [options, setOptions] = useState<string>("Add Name!");
  const [matchFace, setMatchFace] = useState<string>(
    "/assets/defaultFaceToMatch.png"
  );
  const [faceApiStatus, setFaceApiStatus] = useState<FaceApiStatus>({
    modelsLoad: true,
    detecting: false,
    faceDetected: false,
  });

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error starting video stream:", error);
    }
  };

  const loadFaceAPIModels = async () => {
    const MODEL_URL = "/models"; // Ensure the path to the models is correct
    try {
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      console.log("Models loaded");
    } catch (error) {
      console.error("Error loading FaceAPI models:", error);
    }
  };

  const getFaceToMatch = async () => {
    const refFace = await faceapi.fetchImage(matchFace);
    const refFaceDetection = await faceapi
      .detectAllFaces(refFace)
      .withFaceLandmarks()
      .withFaceDescriptors();
    if (refFaceDetection.length > 0) {
      const faceMatcher = new faceapi.FaceMatcher(refFaceDetection);
      return faceMatcher;
    }
  };

  const detectFacesFromFaceApi = async (
    vidFeed: HTMLVideoElement,
    canvasFeed: HTMLCanvasElement
  ) => {
    const ctx = canvasFeed.getContext("2d");

    // faceapi.matchDimensions(canvasFeed, vidFeed);

    const interval = setInterval(async () => {
      // console.log(matchFace); // face that should be match

      const detections = await faceapi
        .detectAllFaces(vidFeed, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withAgeAndGender()
        .withFaceExpressions()
        .withFaceDescriptors();

      if (detections.length > 0) {
        setFaceApiStatus((prevStatus) => ({
          ...prevStatus,
          detecting: false,
          faceDetected: true,
        }));

        const resizedDetections = faceapi.resizeResults(detections, {
          width: vidFeed.videoWidth,
          height: vidFeed.videoHeight,
        });

        ctx!.clearRect(0, 0, canvasFeed.width, canvasFeed.height);

        faceapi.draw.drawFaceLandmarks(canvasFeed, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvasFeed, resizedDetections);

        let faceMatcher = await getFaceToMatch();
        resizedDetections.forEach((face) => {
          const { age, gender, genderProbability, detection, descriptor } =
            face;
          const genderText = `${gender} (${
            (Math.round(genderProbability * 100) / 100) * 100
          }%)`;
          const ageText = `${Math.round(age)} years`;

          new faceapi.draw.DrawTextField(
            [genderText, ageText],
            detection.box.topRight
          ).draw(canvasFeed);

          if (faceMatcher) {
            const label = faceMatcher.findBestMatch(descriptor).toString();

            let labelMain = "Face Recognized / Matched";
            if (label.includes("unknown")) {
              labelMain = "Unknown Human...";
            }

            const drawBox = new faceapi.draw.DrawTextField(
              labelMain,
              detection.box.topLeft
            );
            drawBox.draw(canvasFeed);
          }
        });
      }
    }, 200);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  };

  useEffect(() => {
    const init = async () => {
      await loadFaceAPIModels();

      setFaceApiStatus((prevStatus) => ({
        ...prevStatus,
        modelsLoad: false,
        detecting: true,
        faceDetected: false,
      }));

      await startVideo();
      if (!videoRef.current || !canvasRef.current) return;

      const vidFeed = videoRef.current;
      const canvasFeed = canvasRef.current;

      vidFeed.onloadedmetadata = () => {
        canvasFeed.width = vidFeed.videoWidth;
        canvasFeed.height = vidFeed.videoHeight;

        detectFacesFromFaceApi(vidFeed, canvasFeed);
      };
    };
    init();
  }, [matchFace]);

  return (
    <section className="relative w-full h-[92vh] flex flex-col lg:flex-row gap-1 p-4 ease-in-out duration-300 overflow-hidden">
      <div
        className={`relative w-full h-1/2 lg:w-[60%] lg:h-full rounded-2xl flex flex-col items-center justify-center overflow-hidden  ${
          videoRef.current === null &&
          "bg-[url('/assets/loadTwo.gif')] bg-cover bg-no-repeat"
        }`}
      >
        <video
          ref={videoRef}
          width="720"
          height="660"
          autoPlay
          className="lg:scale-105 rounded-xl shadow-[0_0_50px_rgba(30,30,30,0.78)]"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-[82%] lg:h-full mt-5 lg:mt-0"
        />
      </div>
      <div className="addFaceImage relative w-full h-1/2 lg:w-[38%] lg:h-full flex items-center justify-center">
        {faceApiStatus.faceDetected && (
          <div className="absolute top-5 w-full text-center font-bold text-green-400">
            Face Detected!
          </div>
        )}
        <UploadImage
          options={options}
          setOptions={setOptions}
          setMatchFace={setMatchFace}
        />
      </div>
      <>
        {faceApiStatus.modelsLoad && (
          <div className="absolute z-10 left-0 right-0 bottom-0 w-full h-full flex items-center justify-center backdrop-blur-md">
            <span className="text-3xl font-semibold">Modules Loading...</span>
          </div>
        )}
        {faceApiStatus.detecting && (
          <div className="absolute z-10 left-0 right-0 bottom-0 w-full h-full flex flex-col items-center justify-center backdrop-blur-md">
            <Image
              src="/assets/faceLoadingPng.gif"
              alt="detecting face..."
              loading="lazy"
              width={400}
              height={400}
            />
            <span className="text-3xl font-semibold">Detecting Face...</span>
          </div>
        )}
      </>
    </section>
  );
};

export default FaceRecognize;
