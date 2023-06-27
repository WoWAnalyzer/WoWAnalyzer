
import { TalentEntry } from 'parser/core/Events';
import PlayerInfoTalent from 'interface/report/Results/PlayerInfoTalent';

interface Props {
  talents: TalentEntry[];
}

const PlayerInfoTalents = ({ talents }: Props) => {
  if (talents.every((talent) => talent.spellID === 0)) {
    return (
      <div className="player-details-talents">
        <h3>
          <>Talents</>
        </h3>
        <div className="talent-info">
          <>
            An error occurred while parsing talents. Talent information for the build this log is
            from may not be available.
          </>
        </div>
      </div>
    );
  }

  return (
    <div className="player-details-talents">
      <h3>
        <>Talents</>
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
