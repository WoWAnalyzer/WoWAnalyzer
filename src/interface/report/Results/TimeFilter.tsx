import { Trans } from '@lingui/react/macro';
import Fight from 'parser/core/Fight';
import type { FormEvent, MouseEvent } from 'react';
import { useEffect, useState } from 'react';

import TimeInput from './TimeInput';
import styles from './TimeFilter.module.scss';

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

  // reset time filters when the fight changes. again, eslint not happy about this.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const boundary = generateBoundary(props.fight);
    setStart(boundary.start);
    setEnd(boundary.end);
    setMax(boundary.max);
  }, [props.fight]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const selectStart = (start: number) => {
    setStart(start);
  };

  const selectEnd = (end: number) => {
    setEnd(end);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    props.applyFilter(start, end);
  };

  const handleReset = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    props.applyFilter(0, max);
  };

  const invalidTimes = () => end <= start || end < 0 || end > max || start < 0 || start > max;

  const isReset = () =>
    props.fight.offset_time === 0 && props.fight.end_time === props.fight.original_end_time;

  const { isLoading } = props;
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <span>Start Time</span>
        <TimeInput name="start" min={0} max={max} time={start} onChange={selectStart} />
      </div>
      <div>
        <span>End Time</span>
        <TimeInput name="end" min={0} max={max} time={end} onChange={selectEnd} />
      </div>
      <div className={styles.actions}>
        <button
          className={`${styles.button} ${styles.resetButton}`}
          onClick={handleReset}
          name="reset"
          disabled={isLoading || isReset()}
        >
          <Trans id="interface.report.results.timeFilter.reset">Reset Filter</Trans>
          <span className="glyphicon glyphicon-chevron-right" aria-hidden />
        </button>
        <button
          className={styles.button}
          type="submit"
          name="filter"
          disabled={isLoading || invalidTimes()}
        >
          <Trans id="interface.report.results.timeFilter.filter">Filter</Trans>
          <span className="glyphicon glyphicon-chevron-right" aria-hidden />
        </button>
      </div>
    </form>
  );
};

export default TimeFilter;
