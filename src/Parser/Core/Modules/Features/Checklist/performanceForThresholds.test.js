import performanceForThresholds from './performanceForThresholds';

const EPS = 1e-16;
const MARGIN = 0.01;

function lessThanThreshold(offset, from, thresholds = { minor: 0.9, average: 0.8, major: 0.7 }) {
  return {
    actual: thresholds[from] + offset,
    isLessThan: thresholds,
    style: 'percentage',
  };
}

function greaterThanThreshold(offset, from, thresholds = { minor: 0.1, average: 0.2, major: 0.3 }) {
  return {
    actual: thresholds[from] + offset,
    isGreaterThan: thresholds,
    style: 'percentage',
  };
}

describe('performanceForThresholds', () => {

  describe('isLessThan', () => {
    it('should report 1.0 for >= minor', () => {
      expect(performanceForThresholds(lessThanThreshold(0, 'minor'))).toBe(1.0);
    });

    it('should report *almost* 1.0 for ~ minor', () => {
      expect(performanceForThresholds(lessThanThreshold(-EPS, 'minor'))).toBeGreaterThan(0.99);
    });

    it('should report *almost* 0.666 for ~ average (above)', () => {
      expect(Math.abs(performanceForThresholds(lessThanThreshold(EPS, 'average')) - 0.666)).toBeLessThan(MARGIN);
    });

    it('should report *almost* 0.666 for ~ average (below)', () => {
      expect(Math.abs(performanceForThresholds(lessThanThreshold(-EPS, 'average')) - 0.666)).toBeLessThan(MARGIN);
    });

    it('should report *almost* 0.333 for ~ major (above)', () => {
      expect(Math.abs(performanceForThresholds(lessThanThreshold(EPS, 'major')) - 0.333)).toBeLessThan(MARGIN);
    });

    it('should report *almost* 0.333 for ~ major (below)', () => {
      expect(Math.abs(performanceForThresholds(lessThanThreshold(-EPS, 'major')) - 0.333)).toBeLessThan(MARGIN);
    });

    it('should report 0 for 0', () => {
      expect(performanceForThresholds(lessThanThreshold(-0.7, 'major'))).toBe(0);
    })
  });

  describe('isGreaterThan', () => {
    it('should report 1.0 for <= minor', () => {
      expect(performanceForThresholds(greaterThanThreshold(0, 'minor'))).toBe(1.0);
    });

    it('should report *almost* 1.0 for ~ minor', () => {
      expect(performanceForThresholds(greaterThanThreshold(EPS, 'minor'))).toBeGreaterThan(0.99);
    });

    it('should report *almost* 0.666 for ~ average (above)', () => {
      expect(Math.abs(performanceForThresholds(greaterThanThreshold(-EPS, 'average')) - 0.666)).toBeLessThan(MARGIN);
    });

    it('should report *almost* 0.666 for ~ average (below)', () => {
      expect(Math.abs(performanceForThresholds(greaterThanThreshold(+EPS, 'average')) - 0.666)).toBeLessThan(MARGIN);
    });

    it('should report *almost* 0.333 for ~ major (above)', () => {
      expect(Math.abs(performanceForThresholds(greaterThanThreshold(-EPS, 'major')) - 0.333)).toBeLessThan(MARGIN);
    });

    it('should report *almost* 0.333 for ~ major (below)', () => {
      expect(Math.abs(performanceForThresholds(greaterThanThreshold(+EPS, 'major')) - 0.333)).toBeLessThan(MARGIN);
    });

    it('should report 0 for ∞', () => {
      expect(performanceForThresholds(greaterThanThreshold(Infinity, 'major'))).toBe(0);
    })
  });
});
