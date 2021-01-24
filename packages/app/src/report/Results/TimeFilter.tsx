import React, { useEffect, useState } from 'react';
import Fight from 'parser/core/Fight';
import { Trans } from '@lingui/macro';

import TimeInput from './TimeInput';

interface Props {
  fight: Fight;
  isLoading: boolean;
  applyFilter: (start: number, end: number) => void;
}

const generateBoundary = (fight: Fight) => ({
  start: fight.offset_time,
  end: fight.end_time - fight.start_time + fight.offset_time,
  max: (fight.original_end_time || fight.end_time) - fight.start_time + fight.offset_time,
});

const TimeFilter = (props: Props) => {
  const [start, setStart] = useState<number>(0);
  const [end, setEnd] = useState<number>(0);
  const [max, setMax] = useState<number>(0);

  useEffect(() => {
    const boundary = generateBoundary(props.fight);
    setStart(boundary.start);
    setEnd(boundary.end);
    setMax(boundary.max);
  }, [props.fight]);

  const selectStart = (start: number) => {
    setStart(start);
  };

  const selectEnd = (end: number) => {
    setEnd(end);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    props.applyFilter(start, end);
  };

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    props.applyFilter(0, max);
  };

  const invalidTimes = () => end <= start || end < 0 || end > max || start < 0 || start > max;

  const isReset = () => props.fight.offset_time === 0 && props.fight.end_time === props.fight.original_end_time;

  const { isLoading } = props;
  return (
    <form onSubmit={handleSubmit}>
      <TimeInput name="start" min={0} max={max} time={start} onChange={selectStart} />
      to
      <TimeInput name="end" min={0} max={max} time={end} onChange={selectEnd} />
      <div className="buttons">
        <button
          type="submit"
          name="filter"
          className="btn btn-primary filter animated-button"
          disabled={isLoading || invalidTimes()}
        >
          <Trans id="interface.report.results.timeFilter.filter">Filter</Trans>
          <span className="glyphicon glyphicon-chevron-right" aria-hidden />
        </button>
        <button
          onClick={handleReset}
          name="reset"
          className="btn btn-primary reset-filter animated-button"
          disabled={isLoading || isReset()}
        >
          <Trans id="interface.report.results.timeFilter.reset">Reset Filter</Trans>
          <span className="glyphicon glyphicon-chevron-right" aria-hidden />
        </button>
      </div>
    </form>
  );
};

export default TimeFilter;
