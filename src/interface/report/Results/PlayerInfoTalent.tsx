import SpellIcon from 'interface/SpellIcon';
import SpellLink from 'interface/SpellLink';
import { TalentEntry } from 'parser/core/Events';
import maybeGetTalent from 'common/TALENTS/maybeGetTalent';
import Icon from 'interface/Icon';

interface Props {
  talentEntry: TalentEntry;
}

const FALLBACK_ICON = 'inv_misc_questionmark';

const PlayerInfoTalent = ({ talentEntry }: Props) => {
  const talent = maybeGetTalent(talentEntry.spellID);
  if (!talent) {
    return (
      <>
        <div className="talent-icon">
          <Icon icon={FALLBACK_ICON} style={{ width: '2em', height: '2em' }} />
        </div>
        <div className="talent-name">
          <SpellLink id={talentEntry.spellID} icon={false}>
            Unknown talent: {talentEntry.spellID}
          </SpellLink>
        </div>
      </>
    );
  }

  return (
    <div className="talent-info-row" style={{ marginBottom: '0.8em', fontSize: '1.3em' }}>
      <>
        <div className="talent-icon">
          <SpellIcon id={talent} style={{ width: '2em', height: '2em' }} />
        </div>
        <div className="talent-name">
          <SpellLink id={talent} icon={false}>
            {talent.name}
          </SpellLink>
        </div>
        <div className="talent-level">{talentEntry.rank}</div>
      </>
    </div>
  );
};

export default PlayerInfoTalent;
