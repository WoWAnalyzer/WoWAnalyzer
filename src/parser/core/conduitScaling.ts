export default function conduitScaling(rankOne: number, requiredRank: number) {
  const scalingFactor = rankOne * 0.1;
  const rankZero = rankOne - scalingFactor;
  const rankRequested = rankZero + scalingFactor * requiredRank;
  return rankRequested;
}
