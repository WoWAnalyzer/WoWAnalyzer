import React from 'react';

import SpellLink from 'common/SpellLink';
import Requirement, {
  RequirementThresholds,
} from 'parser/shared/modules/features/Checklist/Requirement';

type Props = {
  id: number;
  thresholds: RequirementThresholds;
};

const DotUptime = ({ id, thresholds }: Props) => (
  <Requirement
    name={
      <>
        <SpellLink id={id} icon /> uptime
      </>
    }
    thresholds={thresholds}
  />
);

export default DotUptime;
