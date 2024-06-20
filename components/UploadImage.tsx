"use client";

import { useState, DragEvent, ChangeEvent } from "react";

interface UploadImageProps {
  options: string;
  setOptions: (options: string) => void;
  setMatchFace: (matchFace: string) => void;
}

const UploadImage = ({
  options,
  setOptions,
  setMatchFace,
}: UploadImageProps) => {
  const [highlight, setHighlight] = useState<boolean>(false);
  const [preview, setPreview] = useState<string>("");
  const [drop, setDrop] = useState<boolean>(false);

  const handleEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("enter!");

    preview === "" && setHighlight(true);
  };

  const handleOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("over!");

    preview === "" && setHighlight(true);
  };

  const handleLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("leave!");
    setHighlight(false);
  };

  const handleUpload = (
    e: DragEvent<HTMLDivElement> | ChangeEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("drop!");
    setHighlight(false);
    setDrop(true);

    const files =
      (e.target as HTMLInputElement).files ||
      (e as DragEvent).dataTransfer?.files;
    if (files && files.length > 0) {
      const [file]: any = files;
      uploadFile(file);
    }
  };

  const handleDeselect = () => {
    setPreview("");
    setDrop(false);
  };

  function uploadFile(file: File) {
    const reader = new FileReader();
    reader.readAsBinaryString(file);

    reader.onload = () => {
      // this is the base64 data
      const fileRes = btoa(reader.result as string);
      const base64Image = `data:image/jpg;base64,${fileRes}`;
      // console.log(base64Image);
      setPreview(base64Image);
      setMatchFace(base64Image); // Setting the match face image
    };

    reader.onerror = () => {
      console.log("There is a problem while uploading...");
    };
  }

  return (
    <section className="flex flex-col gap-4">
      <div
        onDragEnter={handleEnter}
        onDragLeave={handleLeave}
        onDragOver={handleOver}
        onDrop={handleUpload}
        className={`flex flex-col items-center ${
          preview ? "justify-end" : "justify-center"
        } border-2 border-dashed p-4 w-96 h-96 cursor-pointer ${
          highlight ? "border-blue-500 bg-blue-100" : ""
        } ${drop ? "border-green-500" : ""}`}
        style={{
          backgroundImage: `url(${preview})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {preview ? (
          <button
            onClick={handleDeselect}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 active:translate-y-1 ease-in-out duration-200"
          >
            Deselect Image
          </button>
        ) : (
          <form className="flex flex-col items-center space-y-2">
            <p className="text-gray-700">Drop image here</p>
            <div className="flex flex-col items-center space-y-2">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleUpload}
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Upload Here
              </label>
            </div>
          </form>
        )}
      </div>
      {/* <input
        type="text"
        placeholder="Enter Your Name"
        onChange={(e) => setOptions(e.target.value)}
        className="bg-transparent  shadow-[0_0_20px_rgba(30,30,30)] outline-none p-2"
      />
      {options} */}
    </section>
  );
};

export default UploadImage;
