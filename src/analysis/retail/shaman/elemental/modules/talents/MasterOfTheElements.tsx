import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { isTalent } from 'common/TALENTS/types';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { CastPerformanceBox, CastPerformanceEntry } from '../elements/CastPerformanceBox';
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
    TALENTS.ELEMENTAL_BLAST_TALENT,
    SPELLS.ELEMENTAL_BLAST_OVERLOAD,
    TALENTS.EARTH_SHOCK_TALENT,
  ],
  AFFECTED_CASTS: [
    TALENTS.EARTHQUAKE_TALENT,
    TALENTS.ICEFURY_TALENT,
    TALENTS.FROST_SHOCK_TALENT,
    TALENTS.ELEMENTAL_BLAST_TALENT,
    TALENTS.CHAIN_LIGHTNING_TALENT,
    TALENTS.EARTH_SHOCK_TALENT,
    SPELLS.LIGHTNING_BOLT,
  ],
  TALENTS: [
    TALENTS.ICEFURY_TALENT.id,
    TALENTS.ELEMENTAL_BLAST_TALENT.id,
    TALENTS.EARTHQUAKE_TALENT.id,
    TALENTS.ICEFURY_TALENT.id,
    TALENTS.FROST_SHOCK_TALENT.id,
    TALENTS.ELEMENTAL_BLAST_TALENT.id,
    TALENTS.CHAIN_LIGHTNING_TALENT.id,
    TALENTS.EARTH_SHOCK_TALENT.id,
  ],
};

class MasterOfTheElements extends Analyzer {
  moteBuffedAbilities: { [key: number]: number } = {};
  moteActivationTimestamp: number | null = null;
  moteConsumptionTimestamp: number | null = null;
  damageGained = 0;
  castEntries: CastPerformanceEntry[] = [];

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

    this.addCastEntry(event);
  }

  addCastEntry(event: CastEvent) {
    const spellId = event.ability.guid;
    if (
      [
        TALENTS.EARTH_SHOCK_TALENT.id,
        TALENTS.EARTHQUAKE_TALENT.id,
        TALENTS.ELEMENTAL_BLAST_TALENT.id,
      ].includes(spellId)
    ) {
      this.castEntries.push({
        value: QualitativePerformance.Good,
        spellId,
        timestamp: event.timestamp,
      });
    } else if ([SPELLS.LIGHTNING_BOLT.id, TALENTS.CHAIN_LIGHTNING_TALENT.id].includes(spellId)) {
      this.castEntries.push({
        value: QualitativePerformance.Ok,
        spellId,
        timestamp: event.timestamp,
      });
    } else {
      this.castEntries.push({
        value: QualitativePerformance.Fail,
        spellId,
        timestamp: event.timestamp,
      });
    }
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
                  <th>Buffed Casts</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(this.moteBuffedAbilities).map((e) => (
                  <tr key={e}>
                    <th>
                      <SpellLink id={Number(e)} />
                    </th>
                    <td>{this.moteBuffedAbilities[Number(e)]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.MASTER_OF_THE_ELEMENTS_TALENT.id}>
          <>
            <ItemDamageDone amount={this.damageGained} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  performanceBoxValues() {
    return Object.entries(this.moteBuffedAbilities)
      .map(([id, count]) => [parseInt(id, 10), count] as const)
      .filter(([id, count]) => id !== SPELLS.LIGHTNING_BOLT.id && count > 0);
  }

  guideSubsection() {
    // TODO: ST vs AE, what if they don't have EB?
    const explanation = (
      <p>
        All your <SpellLink id={TALENTS.MASTER_OF_THE_ELEMENTS_TALENT} /> should be spent on{' '}
        <SpellLink id={TALENTS.EARTH_SHOCK_TALENT} />,{' '}
        <SpellLink id={TALENTS.ELEMENTAL_BLAST_TALENT} /> or{' '}
        <SpellLink id={TALENTS.EARTHQUAKE_TALENT} />
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink id={TALENTS.MASTER_OF_THE_ELEMENTS_TALENT.id} /> usage
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            <CastPerformanceBox
              entries={this.castEntries}
              startTime={this.owner.fight.start_time}
            />
          </div>
        </RoundedPanel>
      </div>
    );

    // TODO: magic number
    return explanationAndDataSubsection(explanation, data, GUIDE_EXPLANATION_PERCENT_WIDTH);
  }
}

export default MasterOfTheElements;
