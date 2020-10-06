import { getReportCode } from './ReportSelecter';

describe('ReportSelector', () => {
  test('getCode accepts just the report code', () => {
    expect(getReportCode('AB1CDEf2G3HIjk4L')).toBe('AB1CDEf2G3HIjk4L');
  });
  test('getCode accepts base report url', () => {
    expect(getReportCode('https://www.warcraftlogs.com/reports/AB1CDEf2G3HIjk4L')).toBe('AB1CDEf2G3HIjk4L');
    expect(getReportCode('https://www.warcraftlogs.com/reports/AB1CDEf2G3HIjk4L/')).toBe('AB1CDEf2G3HIjk4L');
  });
  test('getCode accepts relative url', () => {
    expect(getReportCode('reports/AB1CDEf2G3HIjk4L')).toBe('AB1CDEf2G3HIjk4L');
    expect(getReportCode('reports/AB1CDEf2G3HIjk4L/')).toBe('AB1CDEf2G3HIjk4L');
  });
  test('getCode accepts report code with hashtag', () => {
    expect(getReportCode('AB1CDEf2G3HIjk4L#fight=6&type=healing&source=10')).toBe('AB1CDEf2G3HIjk4L');
    expect(getReportCode('AB1CDEf2G3HIjk4L/#fight=6&type=healing&source=10')).toBe('AB1CDEf2G3HIjk4L');
  });
  test('getCode accepts full url with hashtag', () => {
    expect(getReportCode('https://www.warcraftlogs.com/reports/AB1CDEf2G3HIjk4L#fight=6&type=healing&source=10')).toBe('AB1CDEf2G3HIjk4L');
    expect(getReportCode('https://www.warcraftlogs.com/reports/AB1CDEf2G3HIjk4L/#fight=6&type=healing&source=10')).toBe('AB1CDEf2G3HIjk4L');
  });
  test('getCode accepts localized urls', () => {
    expect(getReportCode('https://de.warcraftlogs.com/reports/AB1CDEf2G3HIjk4L')).toBe('AB1CDEf2G3HIjk4L');
    expect(getReportCode('https://kr.warcraftlogs.com/reports/AB1CDEf2G3HIjk4L/#fight=3')).toBe('AB1CDEf2G3HIjk4L');
  });
  test('getCode knows to only match the part between reports and #', () => {
    expect(getReportCode('https://www.AAAAAAAAAAAAAAAA.com/reports/AB1CDEf2G3HIjk4L#fight=6&type=healing&source=10')).toBe('AB1CDEf2G3HIjk4L');
    expect(getReportCode('https://www.AAAAAAAAAAAAAAAA.com/reports/AB1CDEf2G3HIjk4L#fight=6&type=AAAAAAAAAAAAAAAA&source=10')).toBe('AB1CDEf2G3HIjk4L');
  });
  test('getCode does not accept malformed report codes', () => {
    expect(getReportCode('https://www.warcraftlogs.com/reports/AB1CDEf2G3HIjk4#fight=6&type=healing&source=10')).toBe(null);
    expect(getReportCode('https://www.warcraftlogs.com/reports/AB1CDEf2G3HIjk-4#fight=6&type=healing&source=10')).toBe(null);
    expect(getReportCode('https://www.warcraftlogs.com/reports/AB1CDEf2G3HIjk4AA#fight=6&type=healing&source=10')).toBe(null);
    expect(getReportCode('https://www.warcraftlogs.com/reports/#fight=6&type=healing&source=10')).toBe(null);
    expect(getReportCode('https://www.warcraftlogs.com/')).toBe(null);
    expect(getReportCode('https://www.warcraftlogs.com/reports/<report code>')).toBe(null);
  });
});
