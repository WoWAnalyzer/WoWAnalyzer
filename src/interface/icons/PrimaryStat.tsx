import { default as STAT, getIcon } from 'parser/shared/modules/features/STAT';

const PrimaryStat = (stat: STAT) => {
  const Icon = getIcon(stat);
  return <Icon />;
};

export default PrimaryStat;
