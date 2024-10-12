import { Trans } from '@lingui/macro';
import { TalentEntry } from 'parser/core/Events';
import PlayerInfoTalent from 'interface/report/Results/PlayerInfoTalent';

interface Props {
  talents: TalentEntry[];
}

const PlayerInfoTalents = ({ talents }: Props) => {
  if (talents.length === 0 || talents.every((talent) => talent.id === 0)) {
    return (
      <div className="player-details-talents">
        <h3>
          <Trans id="common.talents">Talents</Trans>
        </h3>
        <div className="talent-info">
          <Trans id="interface.report.talents.parseFailed">
            An error occurred while parsing talents. Talent information for the build this log is
            from may not be available.
          </Trans>
        </div>
      </div>
    );
  }

  return (
    <div className="player-details-talents">
      <h3>
        <Trans id="common.talents">Talents</Trans>
      </h3>
      <div className="talent-info">
        {talents.map((talent) => (
          <PlayerInfoTalent key={talent.id} talentEntry={talent} />
        ))}
      </div>
    </div>
  );
};

export default PlayerInfoTalents;
