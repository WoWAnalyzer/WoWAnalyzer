import ReportSelecter from './ReportSelecter';

describe('ReportSelector', () => {
  test('getCode accepts just the report code', () => {
    expect(ReportSelecter.getCode('AB1CDEf2G3HIjk4L')).toBe('AB1CDEf2G3HIjk4L');
  });
  test('getCode accepts base report url', () => {
    expect(ReportSelecter.getCode('https://www.warcraftlogs.com/reports/AB1CDEf2G3HIjk4L')).toBe('AB1CDEf2G3HIjk4L');
    expect(ReportSelecter.getCode('https://www.warcraftlogs.com/reports/AB1CDEf2G3HIjk4L/')).toBe('AB1CDEf2G3HIjk4L');
  });
  test('getCode accepts relative url', () => {
    expect(ReportSelecter.getCode('reports/AB1CDEf2G3HIjk4L')).toBe('AB1CDEf2G3HIjk4L');
    expect(ReportSelecter.getCode('reports/AB1CDEf2G3HIjk4L/')).toBe('AB1CDEf2G3HIjk4L');
  });
  test('getCode accepts report code with hashtag', () => {
    expect(ReportSelecter.getCode('AB1CDEf2G3HIjk4L#fight=6&type=healing&source=10')).toBe('AB1CDEf2G3HIjk4L');
    expect(ReportSelecter.getCode('AB1CDEf2G3HIjk4L/#fight=6&type=healing&source=10')).toBe('AB1CDEf2G3HIjk4L');
  });
  test('getCode accepts full url with hashtag', () => {
    expect(ReportSelecter.getCode('https://www.warcraftlogs.com/reports/AB1CDEf2G3HIjk4L#fight=6&type=healing&source=10')).toBe('AB1CDEf2G3HIjk4L');
    expect(ReportSelecter.getCode('https://www.warcraftlogs.com/reports/AB1CDEf2G3HIjk4L/#fight=6&type=healing&source=10')).toBe('AB1CDEf2G3HIjk4L');
  });
  test('getCode accepts localized urls', () => {
    expect(ReportSelecter.getCode('https://de.warcraftlogs.com/reports/AB1CDEf2G3HIjk4L')).toBe('AB1CDEf2G3HIjk4L');
    expect(ReportSelecter.getCode('https://kr.warcraftlogs.com/reports/AB1CDEf2G3HIjk4L/#fight=3')).toBe('AB1CDEf2G3HIjk4L');
  });
  test('getCode knows to only match the part between reports and #', () => {
    expect(ReportSelecter.getCode('https://www.AAAAAAAAAAAAAAAA.com/reports/AB1CDEf2G3HIjk4L#fight=6&type=healing&source=10')).toBe('AB1CDEf2G3HIjk4L');
    expect(ReportSelecter.getCode('https://www.AAAAAAAAAAAAAAAA.com/reports/AB1CDEf2G3HIjk4L#fight=6&type=AAAAAAAAAAAAAAAA&source=10')).toBe('AB1CDEf2G3HIjk4L');
  });
  test('getCode does not accept malformed report codes', () => {
    expect(ReportSelecter.getCode('https://www.warcraftlogs.com/reports/AB1CDEf2G3HIjk4#fight=6&type=healing&source=10')).toBe(null);
    expect(ReportSelecter.getCode('https://www.warcraftlogs.com/reports/AB1CDEf2G3HIjk-4#fight=6&type=healing&source=10')).toBe(null);
    expect(ReportSelecter.getCode('https://www.warcraftlogs.com/reports/AB1CDEf2G3HIjk4AA#fight=6&type=healing&source=10')).toBe(null);
    expect(ReportSelecter.getCode('https://www.warcraftlogs.com/reports/#fight=6&type=healing&source=10')).toBe(null);
    expect(ReportSelecter.getCode('https://www.warcraftlogs.com/')).toBe(null);
    expect(ReportSelecter.getCode('https://www.warcraftlogs.com/reports/<report code>')).toBe(null);
  });
});
