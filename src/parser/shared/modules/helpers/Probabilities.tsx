/**
 * Takes procs, proc attempts and proc chance parameters to return a value that states the odds of getting that amount (or less) procs are.
 * @param actualProcs
 * @param procAttempts
 * @param procChance
 */
import OneVariableBinomialChart from 'interface/others/charts/OneVariableBinomialChart';
import React from 'react';
import { formatNumber } from 'common/format';

export function binProbabilitySingleProcChance(actualProcs: number, procAttempts: number, procChance: number) {
  //Correcting for continuity we add 0.5 to procs, because we're looking for the probability of getting at most the amount of procs we received if P(X <= a), then P(X<a+0.5)
  const correctedActualProcs = actualProcs + 0.5;
  const nonProcChance = 1 - procChance;

  const stddev = Math.sqrt(procChance * nonProcChance * procAttempts);
  const zScore = (correctedActualProcs - singleProbabilityPN(procChance, procAttempts) / stddev);

  return binProbZScoreToPercent(zScore);
}

/**
 * This function converts a zScore to a percentile value that can be used to illustrate the percentage chance of achieving that amount of procs or fewer in a similiar attempt.
 * https://stackoverflow.com/a/16197404
 * @param z
 */
export function binProbZScoreToPercent(z: number) {
  // Z === number of standard deviations from the mean
  // If Z is greater than 6.5 standard deviations from the mean, the number of significant digits will be outside any reasonable range we'd want to show.
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

/**
 * pn is the mean value of procs
 * @param procChance
 * @param procAttempts
 */
export function singleProbabilityPN(procChance: number, procAttempts: number) {
  return procChance * procAttempts;
}

/**
 * qn is the mean value of non procs
 * @param procChance
 * @param procAttempts
 */
export function singleProbabilityQN(procChance: number, procAttempts: number) {
  return (1 - procChance) * procAttempts;
}

export function multipleProbabilitiesBinomialCalculation() {

}

export function plotOneVariableBinomChart(actualProcs: number, procAttempts: number, procChance: number, yDomain: number[], xAxis: any, yAxis: any, tooltip: string, curve: string = 'curveMonotoneX') {
  const { procProbabilities, rangeMin, rangeMax } = setMinMaxProbabilities(actualProcs, procAttempts, procChance);
  return (
    <OneVariableBinomialChart
      probabilities={procProbabilities.slice(rangeMin, rangeMax + 1)}
      actualEvent={{ x: actualProcs, y: binomialPMF(actualProcs, procAttempts, procChance) }}
      yDomain={yDomain}
      xAxis={xAxis}
      yAxis={yAxis}
      curve={curve}
      tooltip={(point: { x: number; }) => `${tooltip} ${formatNumber(point.x)}`}
    />
  );
}

/**
 * Calculates the probability that out of n tries with probability p, we get exactly k positive outcomes
 * @param k {Number} Number of desired positive outcomes
 * @param n {Number} Number of tries
 * @param p {Number} Probability of positive outcome
 */
export function binomialPMF(k: number, n: number, p: number) {
  return binomialDistribution(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function binomialDistribution(n: number, k: number) {
  // n! / (k! * (n - k)!)
  // factorials are awful, let's simplify a bit
  // we know k < n:
  // numerator: n! = 1 * 2 * ... * (n - k) * (n - k + 1) * (n - k + 2 ) * ... * n
  // denominator: k! * (n - k)! = k! * 1 * 2 * ... * (n - k)
  // cancelling out 1 * 2 * ... * (n - k) from both we get:
  // (n - k + 1) * (n - k + 2) * ... n / k!
  let numerator = 1;
  let denominator = 1;
  for (let i = n - k + 1; i <= n; i++) {
    numerator *= i;
  }
  for (let i = 1; i <= k; i++) {
    denominator *= i;
  }
  return numerator / denominator;
}

function resetProbabilityArray(actualProcs: number, procAttempts: number, procChance: number) {
  const procProbabilities = Array.from({ length: procAttempts }, (_x, i: number) => {
    return { x: i, y: binomialPMF(i, procAttempts, procChance) };
  });
  return procProbabilities;
}

function setMinMaxProbabilities(actualProcs: number, procAttempts: number, procChance: number) {
  const threshold = 0.001;
  const procProbabilities = resetProbabilityArray(actualProcs, procAttempts, procChance);
  const rangeMin = procProbabilities.findIndex(({ y }) => y >= threshold);
  const rangeMax = rangeMin + procProbabilities.slice(rangeMin).findIndex(({ y }) => y < threshold);

  return {
    procProbabilities,
    rangeMin,
    rangeMax,
  };
}
