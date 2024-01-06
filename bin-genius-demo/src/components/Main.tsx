"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";
import Canvas from "./Canvas";
import { pusherClient } from "@/lib/pusher";
import { cn } from "@/lib/utils";

const debug = false;
const manualDebug = debug && false;

export const ANIMATION_SPEED_MS = 1000; // Time to complete animation

export default function Main() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [result, setResult] = useState<Result | null>(null);

  const handleLoading = () => {
    setIsLoading(true);
  };

  const handleResult = ({
    result,
    recycleProbability,
    landfillProbability,
    compostProbability,
  }: ResultPayload) => {
    setIsLoading(false);
    setResult(result);
    setTimeout(() => {
      setIsOpen(true);
      setTimeout(() => {
        setIsOpen(false);
      }, 3 * ANIMATION_SPEED_MS);
    }, ANIMATION_SPEED_MS);
  };

  useEffect(() => {
    const channelName = "trash-channel";
    const eventName = "trash-classified";
    const loadingEventName = "trash-loading";

    pusherClient.subscribe(channelName);

    pusherClient.bind(eventName, (resultPayload: ResultPayload) => {
      handleResult(resultPayload);
    });
    pusherClient.bind(loadingEventName, () => {
      handleLoading();
    });

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, []);

  return (
    // 100dvh - main padding height - h1 height - footer height
    <div className="relative flex flex-col h-[calc(100dvh-16px-40px-40px)] justify-center">
      {debug && (
        <div className="grow-0 flex justify-between items-center py-2">
          <div className="flex gap-x-2 items-center">
            {manualDebug && (
              <>
                <Toggle
                  pressed={isLoading}
                  onPressedChange={() => setIsLoading((current) => !current)}
                  variant="outline"
                  aria-label="Toggle loading"
                >
                  {isLoading ? "loading" : "not loading"}
                </Toggle>
                <Switch
                  checked={isOpen}
                  onCheckedChange={() => setIsOpen((current) => !current)}
                />
                <span>{isOpen ? "open" : "closed"}</span>
              </>
            )}
          </div>

          <div className="flex gap-x-2">
            <Button
              onClick={() =>
                manualDebug
                  ? setResult("Recycle")
                  : handleResult({ result: "Recycle" })
              }
              className="bg-blue-700 hover:bg-blue-600 active:bg-blue-500"
            >
              Recycle
            </Button>
            <Button
              onClick={() =>
                manualDebug
                  ? setResult("Landfill")
                  : handleResult({ result: "Landfill" })
              }
              className="bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500"
            >
              Landfill
            </Button>
            <Button
              onClick={() =>
                manualDebug
                  ? setResult("Compost")
                  : handleResult({ result: "Compost" })
              }
              className="bg-green-700 hover:bg-green-600 active:bg-green-500"
            >
              Compost
            </Button>
          </div>
        </div>
      )}
      <div className="grow relative flex flex-col m-0 p-0 w-[90vw] h-full border-4 rounded-2xl overflow-hidden">
        <div className="sticky top-0 left-0 m-0 w-full p-3 border-b-2">
          State:{" "}
          {isLoading
            ? "processing..."
            : result
            ? `detected a ${result.toLowerCase()}`
            : "no trash"}
        </div>
        <div
          className={cn(
            "w-full h-full flex items-center justify-center",
            isLoading && "bg-neutral-500"
          )}
        >
          <Canvas isLoading={isLoading} isOpen={isOpen} result={result} />
        </div>
      </div>
    </div>
  );
}
