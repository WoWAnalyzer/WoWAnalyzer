export function singleProbabilityBinomialCalculation(actualProcs: number, procAttempts: number, procChance: number) {
  /**
   *
   */
  const correctedActualProcs = actualProcs + 0.5;
  const nonProcChance = 1 - procChance;

  const stddev = Math.sqrt(procChance * nonProcChance * procAttempts);
  const zScore = (correctedActualProcs - singleProbabilityPN(procChance, procAttempts) / stddev);

  return singleProbabilityZPercent(zScore);
}

export function multipleProbabilitiesBinomialCalculation() {

}

export function singleProbabilityZPercent(z: number) {
  /**
   * If Z is greater than 6.5 standard deviations from the mean, the number of significant digits will be outside any reasonable range we'd want to show.
   */
  if (z < -6.5) {
    return 0;
  }
  if (z > 6.5) {
    return 1;
  }

  let factK = 1;
  let sum = 0;
  let term = 1;
  let k = 0;
  const loopStop = Math.exp(-23);

  while (Math.abs(term) > loopStop) {
    term = 0.3989422804 * Math.pow(-1, k) * Math.pow(z, k) / (2 * k + 1) /
      Math.pow(2, k) * Math.pow(z, k + 1) / factK;
    sum += term;
    k += 1;
    factK *= k;
  }
  sum += 0.5;

  return sum;
}

export function singleProbabilityPN(procChance: number, procAttempts: number) {
  return procChance * procAttempts;
}

export function singleProbabilityQN(procChance: number, procAttempts: number) {
  return (1 - procChance) * procAttempts;
}
