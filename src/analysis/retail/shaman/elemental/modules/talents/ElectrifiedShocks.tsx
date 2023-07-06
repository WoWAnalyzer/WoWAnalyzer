import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { CastPerformanceBox, CastPerformanceEntry } from '../elements/CastPerformanceBox';
import { GUIDE_EXPLANATION_PERCENT_WIDTH } from '../../constants';

const ElectrifiedShocksIncrease = 0.15;

const electrifiedShocks = {
  increase: 0.15,
  affectedCasts: [
    SPELLS.LIGHTNING_BOLT,
    TALENTS.CHAIN_LIGHTNING_TALENT,
    TALENTS.ELEMENTAL_BLAST_TALENT,
    TALENTS.EARTHQUAKE_TALENT,
  ],
  affectedDamage: [
    SPELLS.LIGHTNING_BOLT,
    SPELLS.LIGHTNING_BOLT_INSTANT,
    SPELLS.LIGHTNING_BOLT_OVERLOAD,
    SPELLS.LIGHTNING_BOLT_OVERLOAD_HIT,
    TALENTS.CHAIN_LIGHTNING_TALENT,
    SPELLS.CHAIN_LIGHTNING_INSTANT,
    SPELLS.CHAIN_LIGHTNING_OVERLOAD,
    SPELLS.CHAIN_LIGHTNING_OVERLOAD_UNLIMITED_RANGE,
    TALENTS.ELEMENTAL_BLAST_TALENT,
    SPELLS.ELEMENTAL_BLAST_OVERLOAD,
    TALENTS.EARTHQUAKE_TALENT,
    SPELLS.EARTHQUAKE_DAMAGE,
  ],
};

class ElectrifiedShocks extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  damageGained = 0;
  casts: Record<number, { casts: number; buffedCasts: number }> = {};
  castEntries: CastPerformanceEntry[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ELECTRIFIED_SHOCKS_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(electrifiedShocks.affectedDamage),
      this.onAffectedDamage,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(electrifiedShocks.affectedCasts),
      this.onAffectedCast,
    );
  }

  onAffectedCast(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (!this.casts[spellId]) {
      this.casts[spellId] = { casts: 0, buffedCasts: 0 };
    }
    this.casts[spellId].casts += 1;
    const target = this.enemies.getEntity(event);

    const hasBuff = target && target.hasBuff(TALENTS.ELECTRIFIED_SHOCKS_DEBUFF.id);
    if (hasBuff) {
      this.casts[spellId].buffedCasts += 1;
      this.castEntries.push({
        value: QualitativePerformance.Good,
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

  onAffectedDamage(event: DamageEvent) {
    const target = this.enemies.getEntity(event);
    if (target && target.hasBuff(TALENTS.ELECTRIFIED_SHOCKS_DEBUFF.id)) {
      const damage = calculateEffectiveDamage(event, ElectrifiedShocksIncrease);
      this.damageGained += damage;
    }
  }

  guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink id={TALENTS.ELECTRIFIED_SHOCKS_TALENT.id} />
        </b>{' '}
        greatly increases the strength of your nature spells such as{' '}
        <SpellLink id={TALENTS.ELEMENTAL_BLAST_TALENT} />, <SpellLink id={SPELLS.LIGHTNING_BOLT} />,{' '}
        <SpellLink id={TALENTS.CHAIN_LIGHTNING_TALENT} /> and{' '}
        <SpellLink id={TALENTS.EARTHQUAKE_TALENT} />. The debuff does not need to be up at all
        times, but should be up before you cast any of the affected spells. Periods of heavy
        movement may require that you use your <SpellLink id={TALENTS.FROST_SHOCK_TALENT} /> early
        to fill casts.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink id={TALENTS.ELECTRIFIED_SHOCKS_TALENT} /> value
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

    return explanationAndDataSubsection(explanation, data, GUIDE_EXPLANATION_PERCENT_WIDTH);
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
                  <th>Casts</th>
                  <th>% Buffed</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(this.casts).map(([guid, stats]) => (
                  <tr key={guid}>
                    <th>
                      <SpellLink id={parseInt(guid, 10)} />
                    </th>
                    <td>{stats.casts}</td>
                    <td>{Math.floor((stats.buffedCasts / (stats.casts || 1)) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.ELECTRIFIED_SHOCKS_TALENT.id}>
          <>
            <ItemDamageDone amount={this.damageGained} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ElectrifiedShocks;
