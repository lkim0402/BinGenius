"use client";

import axios from "axios";
import { useState } from "react";
import ImagePredictor from "./ImagePredictor";

export default function Main() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadClient = async () => {
    await axios.post("/api/load-client");
  };

  const handleReceivedResult = async (resultPayload: ResultPayload) => {
    setIsLoading(true);
    await axios.post<ResultPayload>("/api/result", resultPayload);
    setTimeout(() => setIsLoading(false), 5000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center">
      <ImagePredictor
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        handleLoadClient={handleLoadClient}
        handleReceivedResult={handleReceivedResult}
      />
    </main>
  );
}
