import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

import {
  combineQualitativePerformances,
  numberToQualitativePerformance,
  qualitativePerformanceToNumber,
} from './combineQualitativePerformances';

describe('qualitativePerformanceToNumber', () => {
  it.each([
    [QualitativePerformance.Perfect, 3],
    [QualitativePerformance.Good, 2],
    [QualitativePerformance.Ok, 1],
    [QualitativePerformance.Fail, 0],
  ])('converts %p to %p', (performance: QualitativePerformance, result: number) => {
    expect(qualitativePerformanceToNumber(performance)).toEqual(result);
  });
});

describe('numberToQualitativePerformance', () => {
  it.each([
    [3, QualitativePerformance.Perfect],
    [2, QualitativePerformance.Good],
    [1, QualitativePerformance.Ok],
    [0, QualitativePerformance.Fail],
    [-1, QualitativePerformance.Fail],
  ])('converts %p to %p', (performance: number, result: QualitativePerformance) => {
    expect(numberToQualitativePerformance(performance)).toEqual(result);
  });
});

describe('combineQualitativePerformances', () => {
  it.each([
    [[], QualitativePerformance.Perfect],
    [[QualitativePerformance.Perfect], QualitativePerformance.Perfect],
    [[QualitativePerformance.Good], QualitativePerformance.Good],
    [[QualitativePerformance.Ok], QualitativePerformance.Ok],
    [[QualitativePerformance.Fail], QualitativePerformance.Fail],
    [[QualitativePerformance.Perfect, QualitativePerformance.Good], QualitativePerformance.Good],
    [
      [QualitativePerformance.Perfect, QualitativePerformance.Good, QualitativePerformance.Ok],
      QualitativePerformance.Ok,
    ],
    [
      [
        QualitativePerformance.Perfect,
        QualitativePerformance.Good,
        QualitativePerformance.Ok,
        QualitativePerformance.Fail,
      ],
      QualitativePerformance.Fail,
    ],
  ])(
    'combines %p to %p',
    (performances: QualitativePerformance[], result: QualitativePerformance) => {
      expect(combineQualitativePerformances(performances)).toEqual(result);
    },
  );
});
