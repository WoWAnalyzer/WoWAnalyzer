import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { isTalent } from 'common/TALENTS/types';
import { SpellLink } from 'interface';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { GUIDE_EXPLANATION_PERCENT_WIDTH } from '../../constants';

const MASTER_OF_THE_ELEMENTS = {
  INCREASE: 0.2,
  DURATION: 15000,
  WINDOW_DURATION: 500,
  AFFECTED_DAMAGE: [
    TALENTS.ICEFURY_TALENT,
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
    TALENTS.EARTHQUAKE_TALENT,
    TALENTS.ICEFURY_TALENT,
    TALENTS.FROST_SHOCK_TALENT,
    TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT,
    TALENTS.CHAIN_LIGHTNING_TALENT,
    TALENTS.EARTH_SHOCK_TALENT,
    SPELLS.LIGHTNING_BOLT,
  ],
  TALENTS: [
    TALENTS.ICEFURY_TALENT.id,
    TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id,
    TALENTS.EARTHQUAKE_TALENT.id,
    TALENTS.ICEFURY_TALENT.id,
    TALENTS.FROST_SHOCK_TALENT.id,
    TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id,
    TALENTS.CHAIN_LIGHTNING_TALENT.id,
    TALENTS.EARTH_SHOCK_TALENT.id,
  ],
};

class MasterOfTheElements extends Analyzer {
  moteBuffedAbilities: { [key: number]: number } = {};
  moteActivationTimestamp: number | null = null;
  moteConsumptionTimestamp: number | null = null;
  damageGained = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.MASTER_OF_THE_ELEMENTS_TALENT);
    if (!this.active) {
      return;
    }

    Object.values(MASTER_OF_THE_ELEMENTS.AFFECTED_CASTS).forEach((spell) => {
      if (
        (isTalent(spell) && this.selectedCombatant.hasTalent(spell)) ||
        !MASTER_OF_THE_ELEMENTS.TALENTS.includes(spell.id)
      ) {
        this.moteBuffedAbilities[spell.id] = 0;
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
    if (this.moteActivationTimestamp === null) {
      //the buff is a clusterfuck so we just track it manually
      return;
    }
    this.moteConsumptionTimestamp = event.timestamp;
    this.moteActivationTimestamp = null;
    event.meta = event.meta || {};
    event.meta.isEnhancedCast = true;
    this.moteBuffedAbilities[event.ability.guid] += 1;
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
                {Object.keys(this.moteBuffedAbilities).map((e) => (
                  <tr key={e}>
                    <th>
                      <SpellLink spell={Number(e)} />
                    </th>
                    <td>{this.moteBuffedAbilities[Number(e)]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.MASTER_OF_THE_ELEMENTS_TALENT}>
          <>
            <ItemDamageDone amount={this.damageGained} />
          </>
        </TalentSpellText>
      </Statistic>
    );
  }

  guideSubsection(): JSX.Element {
    const explanation = <>TODO</>;
    const data = this.statistic();

    return (
      <ExplanationAndDataSubSection
        title="Master of the Elements"
        explanationPercent={GUIDE_EXPLANATION_PERCENT_WIDTH}
        explanation={explanation}
        data={data}
      />
    );
  }
}

export default MasterOfTheElements;
