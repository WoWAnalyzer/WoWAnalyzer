import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { isTalent } from 'common/TALENTS/types';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { addEnhancedCastReason } from 'parser/core/EventMetaLib';
import { ENABLE_MOTE_CHECKS } from '../../constants';

const MASTER_OF_THE_ELEMENTS = {
  INCREASE: 0.15,
  DURATION: 15000,
  WINDOW_DURATION: 500,
  AFFECTED_DAMAGE: [
    SPELLS.ICEFURY,
    SPELLS.ICEFURY_OVERLOAD,
    TALENTS.FROST_SHOCK_TALENT,
    SPELLS.LIGHTNING_BOLT,
    SPELLS.LIGHTNING_BOLT_OVERLOAD,
    TALENTS.CHAIN_LIGHTNING_TALENT,
    SPELLS.CHAIN_LIGHTNING_OVERLOAD,
    TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT,
    SPELLS.ELEMENTAL_BLAST_OVERLOAD,
    TALENTS.EARTH_SHOCK_TALENT,
  ],
  AFFECTED_CASTS: [
    TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT,
    TALENTS.EARTHQUAKE_2_ELEMENTAL_TALENT,
    SPELLS.ICEFURY,
    TALENTS.FROST_SHOCK_TALENT,
    TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT,
    TALENTS.CHAIN_LIGHTNING_TALENT,
    TALENTS.EARTH_SHOCK_TALENT,
    SPELLS.LIGHTNING_BOLT,
  ],
  TALENTS: [
    TALENTS.ICEFURY_TALENT.id,
    TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id,
    TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT.id,
    TALENTS.EARTHQUAKE_2_ELEMENTAL_TALENT.id,
    TALENTS.ICEFURY_TALENT.id,
    TALENTS.FROST_SHOCK_TALENT.id,
    TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id,
    TALENTS.CHAIN_LIGHTNING_TALENT.id,
    TALENTS.EARTH_SHOCK_TALENT.id,
  ],
};

class MasterOfTheElements extends Analyzer {
  moteBuffedAbilities = new Map<number, number>();
  moteActivationTimestamp: number | null = null;
  moteConsumptionTimestamp: number | null = null;
  damageGained = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.MASTER_OF_THE_ELEMENTS_ELEMENTAL_TALENT);
    if (!this.active) {
      return;
    }

    Object.values(MASTER_OF_THE_ELEMENTS.AFFECTED_CASTS).forEach((spell) => {
      if (
        (isTalent(spell) && this.selectedCombatant.hasTalent(spell)) ||
        !MASTER_OF_THE_ELEMENTS.TALENTS.includes(spell.id)
      ) {
        this.moteBuffedAbilities.set(spell.id, 0);
      }
    });

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(MASTER_OF_THE_ELEMENTS.AFFECTED_CASTS),
      this._onCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.LAVA_BURST_TALENT),
      this._onLvBCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(MASTER_OF_THE_ELEMENTS.AFFECTED_DAMAGE),
      this._onDamage,
    );
  }

  _onCast(event: CastEvent) {
    if (
      this.moteActivationTimestamp === null ||
      !this.moteBuffedAbilities.has(event.ability.guid)
    ) {
      //the buff is a clusterfuck so we just track it manually
      return;
    }
    this.moteConsumptionTimestamp = event.timestamp;
    this.moteActivationTimestamp = null;
    ENABLE_MOTE_CHECKS &&
      addEnhancedCastReason(
        event,
        <>
          Cast with <SpellLink spell={TALENTS.MASTER_OF_THE_ELEMENTS_ELEMENTAL_TALENT} />
        </>,
      );
    this.moteBuffedAbilities.set(
      event.ability.guid,
      this.moteBuffedAbilities.get(event.ability.guid)! + 1,
    );
  }

  _onLvBCast(event: CastEvent) {
    this.moteActivationTimestamp = event.timestamp;
  }

  _onDamage(event: DamageEvent) {
    if (event.timestamp < (this.moteConsumptionTimestamp || 0)) {
      return;
    }
    if (
      event.timestamp >
      (this.moteConsumptionTimestamp || Infinity) + MASTER_OF_THE_ELEMENTS.WINDOW_DURATION
    ) {
      return;
    }
    this.damageGained += calculateEffectiveDamage(event, MASTER_OF_THE_ELEMENTS.INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Ability</th>
                  <th>Number of Buffed Casts</th>
                </tr>
              </thead>
              <tbody>
                {[...this.moteBuffedAbilities.entries()]
                  .filter(([_, casts]) => casts > 0)
                  .map(([spellId, casts]) => (
                    <tr key={spellId}>
                      <td>
                        <SpellLink spell={spellId} />
                      </td>
                      <td>{casts}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.MASTER_OF_THE_ELEMENTS_ELEMENTAL_TALENT}>
          <>
            <ItemDamageDone amount={this.damageGained} />
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MasterOfTheElements;
