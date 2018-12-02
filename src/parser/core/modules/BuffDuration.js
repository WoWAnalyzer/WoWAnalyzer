export const PERMANENT = 'PERMANENT';
const BuffDuration = {
  STATIC: duration => duration,
  AT_MOST: duration => duration,
  HASTED: duration => function () {
    return () => duration / this.haste.current;
  },
  PERMANENT: () => PERMANENT,
};

export default BuffDuration;
