import { useEffect, useReducer, useState } from 'react';
import * as React from 'react';

const SECOND = 1000;
const MINUTE = 60 * SECOND;

interface Props {
  name: string;
  time: number;
  min: number;
  max: number;
  onChange: (time: number) => void;
}

const toMinute = (ms: number) => Math.trunc(ms / MINUTE);

const toSecond = (ms: number) => Math.trunc((ms % MINUTE) / SECOND);

const toMillisecond = (ms: number) => Math.trunc(ms % SECOND);

const convertTime = (time: number) => ({
  milliseconds: toMillisecond(time),
  seconds: toSecond(time),
  minutes: toMinute(time),
});

const TimeInput = (props: Props) => {
  const mRef = React.createRef<HTMLInputElement>();
  const sRef = React.createRef<HTMLInputElement>();
  const msRef = React.createRef<HTMLInputElement>();

  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [milliseconds, setMilliseconds] = useState<number>(0);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    const convertedTime = convertTime(props.time);
    setMinutes(convertedTime.minutes);
    setSeconds(convertedTime.seconds);
    setMilliseconds(convertedTime.milliseconds);
  }, [props.time]);

  const changeTime = (time: number) => {
    if (time > props.max || time < props.min) {
      forceUpdate();
      return;
    }
    const convertedTime = convertTime(props.time);
    setMinutes(convertedTime.minutes);
    setSeconds(convertedTime.seconds);
    setMilliseconds(convertedTime.milliseconds);
    submitChange(time);
  };

  const handleChangeM = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value) || 0;
    if (val > 99) {
      forceUpdate();
      return;
    }
    changeTime(MINUTE * val + SECOND * seconds + milliseconds);
  };

  const handleChangeS = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value) || 0;
    if (val > 99) {
      forceUpdate();
      return;
    }
    changeTime(MINUTE * minutes + SECOND * val + milliseconds);
  };

  const handleChangeMs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value) || 0;
    if (val > 999) {
      forceUpdate();
      return;
    }
    changeTime(MINUTE * minutes + SECOND * seconds + val);
  };

  const submitChange = (time: number) => {
    props.onChange(time);
  };

  const pad = (number: number, digits: number) => number.toString().padStart(digits, '0');

  const { name } = props;
  return (
    <div className={`time-input ${name}`}>
      <input
        ref={mRef}
        className={`form-control ${name}-minute`}
        type="number"
        min="0"
        max="99"
        value={pad(minutes, 2)}
        onChange={handleChangeM}
      />
      :
      <input
        ref={sRef}
        className={`form-control ${name}-second`}
        type="number"
        min="0"
        max="99"
        value={pad(seconds, 2)}
        onChange={handleChangeS}
      />
      .
      <input
        ref={msRef}
        className={`form-control ${name}-millisecond`}
        type="number"
        min="0"
        max="999"
        value={pad(milliseconds, 3)}
        onChange={handleChangeMs}
      />
    </div>
  );
};

export default TimeInput;
