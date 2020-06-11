import OneVariableBinomialChart from 'interface/others/charts/OneVariableBinomialChart';
import React from 'react';
import { formatNumber, formatPercentage } from 'common/format';

/**
 * pn is the mean value of procs
 * @param procChance
 * @param procAttempts
 */
export function expectedProcCount(procChance: number, procAttempts: number) {
  return procChance * procAttempts;
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

/**
 * Calculates the probability that out of n tries with probability p, we get k or less positive outcomes
 * @param k {Number} Number of desired positive outcomes
 * @param n {Number} Number of tries
 * @param p {Number} Probability of positive outcome
 */
export function binomialCDF(k: number, n: number, p: number) {
  let probability = 0;
  for (let i = 0; i <= k; i++) {
    probability += binomialPMF(i, n, p);
  }
  return probability;
}

/**
 * Finds the maximum of PMF of given distribution.
 * @param n {Number} Maximum number of tries for given event
 * @param {Function} pmf Callback that returns probability of exactly K events happening in N tries. Parameters - K, N
 * @returns {{ max: Number, p: Number }} Maximum of given PMF function - argument and probability itself
 */
export function findMax(n: number, pmf: (i: number, n: any) => any) {
  let max = -1;
  let maxP = 0;
  for (let i = 0; i <= n; i++) {
    const probability = pmf(i, n);
    if (probability > maxP) {
      max = i;
      maxP = probability;
    }
  }
  return {
    max,
    p: maxP,
  };
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

function resetProbabilityArray(actualProcs: number, procAttempts: number, procChance: number | number[]) {
  const procProbabilities: { x: number; y: number; }[] = Array.from({ length: procAttempts }, (_x, i: number) => {
    if (typeof procChance === 'number') {
      return { x: i, y: binomialPMF(i, procAttempts, procChance) };
    } else {
      return { x: i, y: poissonBinomialPMF(i, procAttempts, procChance) };
    }
  });

  return procProbabilities;
}

function setMinMaxProbabilities(actualProcs: number, procAttempts: number, procChance: number | number[], threshold: number = 0.001) {
  const procProbabilities = resetProbabilityArray(actualProcs, procAttempts, procChance);
  const rangeMin = procProbabilities.findIndex(({ y }) => y >= threshold);
  const rangeMax = rangeMin + procProbabilities.slice(rangeMin).findIndex(({ y }) => y < threshold);

  return {
    procProbabilities,
    rangeMin,
    rangeMax,
  };
}

/**
 * Recursive formula for calculating the PMF (probability mass function) of Poisson's Binomial Distribution
 * @param k {Number} Number of desired positive outcomes
 * @param j {Number} Number of total tries
 * @param p {[Number]} Probability vector
 * @param lookup {Array} Lookup table
 * @returns {Number} Probability
 */
function Ekj(k: number, j: number, p: number[], lookup: any[][]) {
  if (k === -1) {
    return 0;
  }
  if (k === j + 1) {
    return 0;
  }
  if (k === 0 && j === 0) {
    return 1;
  }
  if (lookup[k][j] !== null) {
    return lookup[k][j];
  }
  // literature uses 1-based indices for probabilities, as we're using an array, we have to use 0 based
  const value: number = (1 - p[j - 1]) * Ekj(k, j - 1, p, lookup) + p[j - 1] * Ekj(k - 1, j - 1, p, lookup);
  lookup[k][j] = value;
  return value;
}

// Poisson's Binomial Distribution
// Methods based on Wikipedia page and this research paper:
// https://www.researchgate.net/publication/257017356_On_computing_the_distribution_function_for_the_Poisson_binomial_distribution

/**
 * Calculates the probability that out of n tries with p probabilities, we get exactly k positive outcomes
 * @param k {Number} Number of desired positive outcomes
 * @param n {Number} Number of total tries
 * @param p {[Number]} Probability vector
 */
export function poissonBinomialPMF(k: number, n: number, p: any[]) {
  // denoted in the paper as ξk, I'll call it Ek for simplicity
  // using the recursive formula in chapter 2.5
  if (p.length !== n) {
    throw new Error('You must supply a probability vector with the same length as the number of total tries into Poisson Binomial PMF');
  }
  // Using a lookup table to simplify recursion a little bit
  // construct an (n+1) x (n+1) lookup table (because Ek,j uses indexes from 0 to n INCLUSIVE, with this we don't have to subtract indexes all the time)
  // intentionally set tu nulls so we know which values are computed or not
  const lookup = [...Array(n + 1)].map(_ => Array(n + 1).fill(null));
  return Ekj(k, n, p, lookup);
}

/**
 * Calculates the probability that out of n tries with p probabilities, we get less than or equal k positive outcomes
 * @param k {Number} Number of desired positive outcomes
 * @param n {Number} Number of total tries
 * @param p {[Number]} Probability vector
 */
export function poissonBinomialCDF(k: number, n: number, p: number[]) {
  // While technically equal to summing Ei from i = 0 to k, since we use recursion, a better solution is a lookup table
  if (p.length !== n) {
    throw new Error('You must supply a probability vector with the same length as the number of total tries into Poisson Binomial CDF');
  }
  // see comments in poissonBinomialPMF
  const lookup = [...Array(n + 1)].map(_ => Array(n + 1).fill(null));
  let probability = 0;
  // since Ekj uses the values from "previous row" (Ekj(k - 1, j - 1, ...)), it's better to iterate from 0
  // this way, it produces the least necessary amount of calculations with the lookup table (only the Ekj(k, j - 1) parts)
  for (let i = 0; i <= k; i++) {
    probability += Ekj(i, n, p, lookup);
  }
  return probability;
}

export function plotOneVariableBinomChart(
  actualProcs: number,
  procAttempts: number,
  procChance: number | number[],
  trackedName: string = 'Procs',
  tooltipText: string = `${trackedName}: `,
  tooltipFormula: (point: { x: number }) => string = (point: { x: number; }) => `${tooltipText} ${formatNumber(point.x)}`,
  yDomain: number[] = [0, 0.4],
  xAxis: any = {
    title: trackedName,
    tickFormat: (value: number) => formatNumber(value),
    style: {
      fill: 'white',
    },
  },
  yAxis: any = {
    title: 'Likelihood',
    tickFormat: (value: number) => `${formatPercentage(value, 0)}%`,
    style: {
      fill: 'white',
    },
  },
  curve: string = 'curveMonotoneX',
) {

  const { procProbabilities, rangeMin, rangeMax } = setMinMaxProbabilities(actualProcs, procAttempts, procChance);
  const actualEventY = typeof procChance === 'number' ? binomialPMF(actualProcs, procAttempts, procChance) : poissonBinomialPMF(actualProcs, procAttempts, procChance);
  return (
    <OneVariableBinomialChart
      probabilities={procProbabilities.slice(rangeMin, rangeMax + 1)}
      actualEvent={{ x: actualProcs, y: actualEventY }}
      yDomain={yDomain}
      xAxis={xAxis}
      yAxis={yAxis}
      curve={curve}
      tooltip={tooltipFormula}
    />
  );
}
