import CHANGELOG from 'CHANGELOG';
import AVAILABLE_CONFIGS from 'Parser/AVAILABLE_CONFIGS';

describe('CHANGELOG', () => {
  const allChangelogs = AVAILABLE_CONFIGS.reduce((obj, config) => {
    const specName = `${config.spec.specName} ${config.spec.className}`;
    obj[specName] = config.changelog;
    return obj;
  }, {
    'Core': CHANGELOG,
  });
  const testEntries = test => {
    Object.keys(allChangelogs).forEach(name => {
      const changelog = allChangelogs[name];

      changelog.forEach((entry, index) => {
        try {
          test(entry);
        } catch (error) {
          // Custom fail handling so that we can point to the proper changelog without poluting the Jest log with all spec names
          // eslint-disable-next-line no-undef
          fail(`Changelog entry #${index} of the ${name} changelog does not meet this requirement.`);
        }
      });
    });
  };

  it('has a date for every entry', () => {
    testEntries(entry => expect(entry.date).toBeDefined());
  });
  it('dates must be an instance of Date', () => {
    testEntries(entry => expect(entry.date).toBeInstanceOf(Date));
  });
  it('dates must be properly formatted (YYYY-MM-DD)', () => {
    const reasonableDate = new Date('2017-01-01');
    testEntries(entry => expect(entry.date > reasonableDate).toBeTruthy());
  });
  it('has changes listed in every entry', () => {
    testEntries(entry => expect(entry.changes).toBeDefined());
  });
  it('has contributors listed in every entry', () => {
    testEntries(entry => expect(entry.contributors).toBeDefined());
  });
  it('only has entries where contributors is an array', () => {
    testEntries(entry => expect(entry.contributors).toBeInstanceOf(Array));
  });
  it('each entry has at least one contributor', () => {
    testEntries(entry => expect(entry.contributors.length).toBeGreaterThan(0));
  });
});
