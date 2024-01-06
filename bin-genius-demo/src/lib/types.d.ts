type Result = "Recycle" | "Landfill" | "Compost";

type ResultPayload = {
  result: Result;
  recycleProbability?: number;
  landfillProbability?: number;
  compostProbability?: number;
};