import { Trans } from '@lingui/macro';
import { maybeGetSpell } from 'common/SPELLS';
import Icon from 'interface/Icon';
import SpellIcon from 'interface/SpellIcon';
import SpellLink from 'interface/SpellLink';
import { TalentEntry } from 'parser/core/Events';

const FALLBACK_ICON = 'inv_misc_questionmark';

interface Props {
  talents: TalentEntry[];
}

const PlayerInfoTalents = ({ talents }: Props) => {
  if (talents.every((talent) => talent.spellID === 0)) {
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
        {talents.map((talent, index) => (
          <div
            key={index}
            className="talent-info-row"
            style={{ marginBottom: '0.8em', fontSize: '1.3em' }}
          >
            {talent.spellID ? (
              <>
                <div className="talent-icon">
                  <SpellIcon id={talent.spellID} style={{ width: '2em', height: '2em' }} />
                </div>
                <div className="talent-name">
                  <SpellLink id={talent.spellID} icon={false}>
                    {maybeGetSpell(talent.spellID)?.name ?? `Unknown spell: ${talent.spellID}`}
                  </SpellLink>
                </div>
                <div className="talent-level">{talent.rank}</div>
              </>
            ) : (
              <>
                <div className="talent-icon">
                  <Icon icon={FALLBACK_ICON} style={{ width: '2em', height: '2em' }} />
                </div>
                <div className="talent-name">
                  <i>No talent active</i>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerInfoTalents;
