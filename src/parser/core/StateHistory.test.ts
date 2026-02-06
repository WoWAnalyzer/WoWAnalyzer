import StateHistory from './StateHistory';

describe('StateHistory', () => {
  const data = [
    { timestamp: 0 },
    { timestamp: 100 },
    { timestamp: 125 },
    { timestamp: 200 },
    { timestamp: 200 },
    { timestamp: 300 },
    { timestamp: 400 },
    { timestamp: 500 },
    { timestamp: 500 },
  ];

  describe('slice', () => {
    it('should include the entire range if it is contained by the start/end', () => {
      const history = new StateHistory(data);
      expect(history.slice(-Infinity, Infinity)).toEqual(data);
    });

    it('should include the entire range when the start/end times match the first/last points', () => {
      const history = new StateHistory(data);
      expect(history.slice(0, 500)).toEqual(data);
    });

    it('should not include points before the starting time', () => {
      const history = new StateHistory(data);
      expect(history.slice(50, Infinity)).toEqual(data.filter((point) => point.timestamp >= 50));
    });

    it('should not include points after the ending time', () => {
      const history = new StateHistory(data);
      expect(history.slice(-Infinity, 450)).toEqual(data.filter((point) => point.timestamp <= 450));
    });

    it('should include the first event that occurs >= start', () => {
      const history = new StateHistory(data);
      expect(history.slice(150, Infinity)).toEqual(data.filter((point) => point.timestamp >= 150));
      expect(history.slice(125, Infinity)).toEqual(data.filter((point) => point.timestamp >= 125));
      expect(history.slice(200, Infinity)).toEqual(data.filter((point) => point.timestamp >= 200));
    });

    it('should include the last event that occurs <= end', () => {
      const history = new StateHistory(data);
      expect(history.slice(-Infinity, 250)).toEqual(data.filter((point) => point.timestamp <= 250));
      expect(history.slice(-Infinity, 450)).toEqual(data.filter((point) => point.timestamp <= 450));
      expect(history.slice(-Infinity, 500)).toEqual(data);
    });
  });

  describe('getBefore', () => {
    it('should return undefined if all events are after `timestamp`', () => {
      const history = new StateHistory(data);
      expect(history.getBefore(-Infinity)).toBeUndefined();
    });

    it('[strict] should return undefined if all events are after or equal to `timestamp`', () => {
      const history = new StateHistory(data);
      expect(history.getBefore(0, true)).toBeUndefined();
    });

    it('should return the last state that occurs on or before the timestamp when one exists', () => {
      const history = new StateHistory(data);
      expect(history.getBefore(0)?.timestamp).toEqual(0);
      expect(history.getBefore(250)?.timestamp).toEqual(200);
      expect(history.getBefore(200)).toEqual(data.findLast((point) => point.timestamp <= 200));
    });

    it('[strict] should return the last state that occurs before the timestamp when one exists', () => {
      const history = new StateHistory(data);
      expect(history.getBefore(0, true)?.timestamp).toBeUndefined();
      expect(history.getBefore(250, true)).toEqual(data.findLast((point) => point.timestamp < 250));
      expect(history.getBefore(200, true)).toEqual(data.findLast((point) => point.timestamp < 200));
    });

    it('should return a value when all events are before `timestamp`', () => {
      const history = new StateHistory(data);
      expect(history.getBefore(Infinity)).toEqual(data[data.length - 1]);
    });
  });

  describe('getAfter', () => {
    it('should return undefined if all events are before `timestamp`', () => {
      const history = new StateHistory(data);
      expect(history.getAfter(Infinity)).toBeUndefined();
    });

    it('[strict] should return undefined if all events are before or equal to `timestamp`', () => {
      const history = new StateHistory(data);
      expect(history.getAfter(500, true)).toBeUndefined();
    });

    it('should return the first state that occurs on or after the timestamp when one exists', () => {
      const history = new StateHistory(data);
      expect(history.getAfter(500)).toEqual(data.find((point) => point.timestamp >= 500));
      expect(history.getAfter(450)).toEqual(data.find((point) => point.timestamp >= 450));
      expect(history.getAfter(300)).toEqual(data.find((point) => point.timestamp >= 300));
    });

    it('[strict] should return the last state that occurs after the timestamp when one exists', () => {
      const history = new StateHistory(data);
      expect(history.getAfter(499, true)).toEqual(data.find((point) => point.timestamp === 500));
      expect(history.getAfter(450, true)).toEqual(data.find((point) => point.timestamp > 450));
      expect(history.getAfter(300, true)).toEqual(data.find((point) => point.timestamp > 300));
    });

    it('should return a value when all events are after `timestamp`', () => {
      const history = new StateHistory(data);
      expect(history.getAfter(-Infinity)).toEqual(data[0]);
    });
  });
});
