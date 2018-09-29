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
    const eventGrouper = new EventGrouper(200);
    eventGrouper.processEvent({ timestamp: 1 });

    const stem = eventGrouper.getStemTimestamp({ timestamp: 99 });

    expect(stem).toEqual(1);
  });

  it('Processes events correctly', () => {
    const eventGrouper = new EventGrouper(100);
    const events = [ { timestamp: 1 }, { timestamp: 99 }, { timestamp: 102 }, { timestamp: 200 } ];
    const eventProcessor = eventGrouper.processEvent.bind(eventGrouper);

    // Add the boys in
    events.forEach(eventProcessor);

    console.log(eventGrouper.cache);

    expect(eventGrouper.cache[1][0]).toEqual({ timestamp: 1 });
    expect(eventGrouper.cache[1][1]).toEqual({ timestamp: 99 });
    expect(eventGrouper.cache[102][0]).toEqual({ timestamp: 102 });
    expect(eventGrouper.cache[102][1]).toEqual({ timestamp: 200 });
  });
});
