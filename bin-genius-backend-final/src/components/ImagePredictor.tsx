import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";

const ModelURL = "https://teachablemachine.withgoogle.com/models/UHd8sOhR_/";

declare global {
  interface Window {
    tmImage: any;
  }
}

interface ImagePredictorProps {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  handleLoadClient: () => void;
  handleReceivedResult: (resultPayload: ResultPayload) => void;
}

const ImagePredictor: React.FC<ImagePredictorProps> = ({
  isLoading,
  setIsLoading,
  handleLoadClient,
  handleReceivedResult,
}) => {
  const [model, setModel] = useState<any>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(true);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(
    null
  );

  useEffect(() => {
    if (window.tmImage) {
      setIsModelLoading(false);
    }
  }, []);

  useEffect(() => {
    if (window.tmImage) {
      initModel();
    }
  }, [isModelLoading]);

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      setSelectedFileName(file.name); // Save the file name
      const reader = new FileReader();
      reader.onload = async () => {
        const image = new Image();
        image.src = reader.result as string;
        image.onload = async () => {
          if (!model) {
            await initModel();
          }
          //   await predict(image);
          setSelectedImage(image);
        };
      };
      reader.readAsDataURL(file);
    },
    [model]
  );

  const resetImage = () => {
    setSelectedFileName("");
    setSelectedImage(null);
    setLabels([]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".bmp", ".tiff"],
    },
  });

  async function initModel() {
    // console.log("initModel", isModelLoading, window.tmImage);
    if (isModelLoading) return;

    const modelURL = ModelURL + "model.json";
    const metadataURL = ModelURL + "metadata.json";
    const loadedModel = await window.tmImage.load(modelURL, metadataURL);
    // console.log("model: ", loadedModel);
    setModel(loadedModel);
  }

  async function predict(image: HTMLImageElement) {
    // console.log("predict", image, model);
    if (!model) return;

    setIsLoading(true);
    handleLoadClient();

    let maxProbability = 0;
    let maxIndex = 0;
    const prediction = await model.predict(image);
    const newLabels = prediction.map((item: any, index: number) => {
      if (item.probability > maxProbability) {
        maxProbability = item.probability;
        maxIndex = index;
      }
      return `${item.className}: ${item.probability.toFixed(2)}`;
    });
    setLabels(newLabels);

    let result: Result;
    switch (maxIndex) {
      case 0:
        result = "Recycle";
        break;
      case 1:
        result = "Landfill";
        break;
      case 2:
        result = "Compost";
        break;
      default:
        result = "Landfill";
    }

    const resultPayload: ResultPayload = {
      result,
      recycleProbability: prediction[0].probability,
      landfillProbability: prediction[1].probability,
      compostProbability: prediction[2].probability,
    };

    handleReceivedResult(resultPayload);
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col mt-8">
      {isModelLoading && <div>Loading model...</div>}
      <form className="w-[60vw] h-[50dvh] flex flex-col" id="imageForm">
        <div
          {...getRootProps()}
          style={{
            border: "2px dashed black",
            padding: "20px",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: "100%",
          }}
        >
          <input disabled={isLoading} {...getInputProps()} />
          <div className="text-3xl">
            {selectedFileName ||
              "Drop an image here, or click to select an image"}
          </div>
        </div>
        <div className="flex justify-between gap-x-2">
          <Button
            type="button"
            disabled={isLoading}
            onClick={() => selectedImage && predict(selectedImage)}
            className="mt-4 text-3xl p-8 w-full"
          >
            Start
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={() => resetImage()}
            className="mt-4 text-3xl p-8 w-full"
          >
            Reset
          </Button>
        </div>
      </form>
      <div id="label-container" className="mt-4">
        {labels.length > 0 ? (
          labels.map((label, index) => <div key={index}>{label}</div>)
        ) : (
          <div>No predictions yet</div>
        )}
      </div>
    </div>
  );
};

export default ImagePredictor;
