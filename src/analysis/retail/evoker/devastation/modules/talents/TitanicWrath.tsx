import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { CastEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TITANIC_WRATH_MULTIPLIER } from 'analysis/retail/evoker/devastation/constants';
import { SpellLink } from 'interface';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { isCastFromEB } from 'analysis/retail/evoker/shared/modules/normalizers/EssenceBurstCastLinkNormalizer';
import { getDisintegrateDamageEvents, getPyreEvents } from '../normalizers/CastLinkNormalizer';

/** Essence Burst increases the damage of affected spells by 15.0%. */
class TitanicWrath extends Analyzer {
  disintegrateDamage = 0;
  pyreDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TITANIC_WRATH_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DISINTEGRATE),
      this.onDisintegrateCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.PYRE_DENSE_TALENT, SPELLS.PYRE]),
      this.onPyreCast,
    );
  }

  private onDisintegrateCast(event: CastEvent) {
    if (!isCastFromEB(event)) return;

    const damageEvents = getDisintegrateDamageEvents(event);
    this.disintegrateDamage += damageEvents.reduce(
      (total, damageEvent) =>
        total + calculateEffectiveDamage(damageEvent, TITANIC_WRATH_MULTIPLIER),
      0,
    );
  }

  private onPyreCast(event: CastEvent) {
    if (!isCastFromEB(event)) return;

    const damageEvents = getPyreEvents(event);
    this.pyreDamage += damageEvents.reduce(
      (total, damageEvent) =>
        total + calculateEffectiveDamage(damageEvent, TITANIC_WRATH_MULTIPLIER),
      0,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>
              <SpellLink spell={SPELLS.DISINTEGRATE} /> Damage:{' '}
              {formatNumber(this.disintegrateDamage)}
            </li>
            <li>
              <SpellLink spell={SPELLS.PYRE} /> Damage: {formatNumber(this.pyreDamage)}
            </li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.TITANIC_WRATH_TALENT}>
          <ItemDamageDone amount={this.disintegrateDamage + this.pyreDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default TitanicWrath;
