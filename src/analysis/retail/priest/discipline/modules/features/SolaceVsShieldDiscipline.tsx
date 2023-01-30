import { Trans } from '@lingui/macro';
import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { RemoveBuffEvent, CastEvent, ResourceChangeEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import './SolaceVsShieldDiscipline.scss';

const SHIELD_DISC_MANA_RETURN_PERCENT = 0.005;

const SOLACE_MANA_RETURN_PERCENT = 0.01;

class SolaceVsShieldDiscipline extends Analyzer {
  consumedShields = 0;
  solaceCasts = 0;
  maxMana = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.POWER_WORD_SOLACE_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_SHIELD),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.POWER_WORD_SOLACE_TALENT),
      this.onSolaceCast,
    );
    this.addEventListener(Events.resourcechange.by(SELECTED_PLAYER), this.checkMaxMana);
  }

  checkMaxMana(event: ResourceChangeEvent) {
    if (this.maxMana > 0) {
      return;
    }
    this.maxMana = event.classResources[0].max;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    if (event.absorb && event.absorb > 0) {
      return;
    }
    this.consumedShields += 1;
  }

  onSolaceCast(event: CastEvent) {
    this.solaceCasts += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            The value for <SpellLink id={TALENTS_PRIEST.POWER_WORD_SOLACE_TALENT.id} /> also
            includes the mana cost of one <SpellLink id={SPELLS.SMITE.id} /> as it is assumed that
            this is what the cast would be replaced by when using Shield Discipline.
          </>
        }
      >
        <BoringValue
          label={
            <>
              {' '}
              <h6>
                <SpellLink id={TALENTS_PRIEST.POWER_WORD_SOLACE_TALENT.id} /> vs{' '}
                <SpellLink id={TALENTS_PRIEST.SHIELD_DISCIPLINE_TALENT.id} />
              </h6>
            </>
          }
        >
          <div className="flex solace-value">
            <div className="flex-sub icon" id="solace-talent-icon">
              <SpellIcon id={TALENTS_PRIEST.POWER_WORD_SOLACE_TALENT.id} />
            </div>
            <div id="solace-info">
              <div className="solace-number">
                {formatThousands(
                  this.solaceCasts *
                    (this.maxMana * SOLACE_MANA_RETURN_PERCENT + SPELLS.SMITE.manaCost),
                )}
              </div>

              <small>
                <Trans id="priest.discipline.statistics.solace.manaRestored">
                  Mana restored from Solace
                </Trans>
              </small>
            </div>
          </div>
          <div className="flex solace-value">
            <div className="flex-sub icon" id="solace-talent-icon">
              <SpellIcon id={TALENTS_PRIEST.SHIELD_DISCIPLINE_TALENT.id} />
            </div>
            <div id="solace-info">
              {formatThousands(
                this.consumedShields * (this.maxMana * SHIELD_DISC_MANA_RETURN_PERCENT),
              )}
              <small>
                <Trans id="priest.discipline.statistics.solace.shieldDisciplinePotential">
                  Shield Discipline potential return
                </Trans>
              </small>
            </div>
          </div>
        </BoringValue>
      </Statistic>
    );
  }
}
export default SolaceVsShieldDiscipline;
