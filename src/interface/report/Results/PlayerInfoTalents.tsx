import { Trans } from '@lingui/react/macro';
import { getTalentTree } from 'common/TALENT_TREES/getTalentTree';
import { TalentEntry } from 'parser/core/Events';

import TalentTree from './TalentTree';

interface Props {
  talents: TalentEntry[];
  specId: number;
}

const PlayerInfoTalents = ({ talents, specId }: Props) => {
  const layout = getTalentTree(specId);
  const parseFailed = talents.length === 0 || talents.every((talent) => talent.id === 0);

  return (
    <div className="row">
      <div className="col-md-12">
        <h2>
          <Trans id="common.talents">Talents</Trans>
        </h2>
        {parseFailed || !layout ? (
          <Trans id="interface.report.talents.parseFailed">
            An error occurred while parsing talents. Talent information for the build this log is
            from may not be available.
          </Trans>
        ) : (
          <TalentTree layout={layout} talents={talents} />
        )}
      </div>
    </div>
  );
};

export default PlayerInfoTalents;
