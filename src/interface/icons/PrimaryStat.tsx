import { default as STAT, getIcon } from 'parser/shared/modules/features/STAT';

const PrimaryStat = (stat: STAT) => {
  const Icon = getIcon(stat);
  // this is not actually creating a new component; it is doing dynamic dispatch
  // eslint-disable-next-line react-hooks/static-components
  return <Icon />;
};

export default PrimaryStat;
