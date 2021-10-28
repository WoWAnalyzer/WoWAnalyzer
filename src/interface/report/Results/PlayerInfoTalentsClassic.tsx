import { Trans } from '@lingui/macro';
import React from 'react';

interface Props {
  talents: number[];
}

const PlayerInfoTalents = ({ talents }: Props) => (
  <>
    <h3>
      <Trans id="common.talents">Talents</Trans>
    </h3>
    <div className="talent-info">{talents.join(' / ')}</div>
  </>
);

export default PlayerInfoTalents;
