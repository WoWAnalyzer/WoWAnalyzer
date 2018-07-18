import EventGrouper from './EventGrouper';

describe('EventGrouper', () => {
  it('Adds a new stem event', () => {
    const eventGrouper = new EventGrouper(0);

    eventGrouper.addNewStemTimestamp({ timestamp: 420 });

    expect(eventGrouper.cache[420]).toBeTruthy();
  });

  it('Checks for events within a threshold correctly', () => {
    const eventGrouper = new EventGrouper(100);
    const branch = 99;

    const isStemOfBranch = eventGrouper.withinThreshold(branch);

    expect(isStemOfBranch(0)).toBe(true);
    expect(isStemOfBranch(300)).toBe(false);
  });

  it('Gets a stem for a branch timestamp', () => {
    const eventGrouper = new EventGrouper(100);
    eventGrouper.processEvent({ timestamp: 0 });

    const stem = eventGrouper.getStemTimestamp({ timestamp: 99 });

    expect(stem).toEqual("0");
  });

  it('Processes events correctly', () => {
    const eventGrouper = new EventGrouper(100);
    const events = [ { timestamp: 0 }, { timestamp: 99 }, { timestamp: 101 }, { timestamp: 200 } ];
    const eventProcessor = eventGrouper.processEvent.bind(eventGrouper);

    // Add the boys in
    events.forEach(eventProcessor);

    expect(eventGrouper.cache[0][0]).toEqual({ timestamp: 0 });
    expect(eventGrouper.cache[0][1]).toEqual({ timestamp: 99 });
    expect(eventGrouper.cache[101][0]).toEqual({ timestamp: 101 });
    expect(eventGrouper.cache[101][1]).toEqual({ timestamp: 200 });
  });
});
