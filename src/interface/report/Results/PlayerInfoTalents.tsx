import { Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import Icon from 'interface/Icon';
import SpellIcon from 'interface/SpellIcon';
import SpellLink from 'interface/SpellLink';

const FALLBACK_ICON = 'inv_misc_questionmark';

interface Props {
  talents: number[];
}

const PlayerInfoTalents = ({ talents }: Props) => {
  const rows = [15, 25, 30, 35, 40, 45, 50];

  return (
    <div className="player-details-talents">
      <h3>
        <Trans id="common.talents">Talents</Trans>
      </h3>
      <div className="talent-info">
        {talents.map((spellId: number, index: number) => (
          <div
            key={index}
            className="talent-info-row"
            style={{ marginBottom: '0.8em', fontSize: '1.3em' }}
          >
            <div className="talent-level">{rows[index]}</div>
            {spellId ? (
              <>
                <div className="talent-icon">
                  <SpellIcon id={spellId} style={{ width: '2em', height: '2em' }} />
                </div>
                <div className="talent-name">
                  <SpellLink id={spellId} icon={false}>
                    {SPELLS[spellId] ? SPELLS[spellId].name : `Unknown spell: ${spellId}`}
                  </SpellLink>
                </div>
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
