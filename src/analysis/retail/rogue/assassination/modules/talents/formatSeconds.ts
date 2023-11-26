const formatSeconds = (ms: number, precision: number = 0): string => {
  if (ms % 1000 === 0) {
    return (ms / 1000).toFixed(0);
  }
  return (ms / 1000).toFixed(precision);
};

export default formatSeconds;
