import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Enemies from 'parser/shared/modules/Enemies';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';

const DIRE_FIXATION_BOOST = 0.08;
// from spell data
const AFFECTED_SPELLS = [
  SPELLS.SHRED,
  SPELLS.FEROCIOUS_BITE,
  SPELLS.THRASH_FERAL,
  SPELLS.THRASH_FERAL_BLEED,
  SPELLS.RIP,
  SPELLS.MAIM,
  SPELLS.RAKE,
  SPELLS.RAKE,
  TALENTS_DRUID.BRUTAL_SLASH_TALENT,
  TALENTS_DRUID.PRIMAL_WRATH_TALENT,
  SPELLS.SWIPE_CAT,
  SPELLS.MOONFIRE_FERAL,
  TALENTS_DRUID.FERAL_FRENZY_TALENT,
  TALENTS_DRUID.RAMPANT_FEROCITY_TALENT,
];

const deps = {
  enemies: Enemies,
};

/**
 * **Dire Fixation**
 * Spec Talent
 *
 * Attacking an enemy with Shred fixates your attention on it for 10 sec.
 * You can fixate on a single target at once.
 * Your attacks deal 8% increased damage to your fixated target.
 */
export default class DireFixation extends Analyzer.withDependencies(deps) {
  /** Damage due to the increase from Dire Fixation */
  damage = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.DIRE_FIXATION_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(AFFECTED_SPELLS),
      this.onAffectedDamage,
    );
  }

  onAffectedDamage(event: DamageEvent) {
    const target = this.deps.enemies.getEntity(event);
    if (!target) {
      return;
    }
    if (target.hasBuff(SPELLS.DIRE_FIXATION_DEBUFF.id)) {
      this.damage += calculateEffectiveDamage(event, DIRE_FIXATION_BOOST);
    }
  }

  get uptime(): number {
    return this.deps.enemies.getBuffUptime(SPELLS.DIRE_FIXATION_DEBUFF.id);
  }

  get uptimePercent(): number {
    return this.uptime / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Uptime on at least one target:{' '}
            <strong>{formatPercentage(this.uptimePercent, 1)}%</strong>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.DIRE_FIXATION_TALENT}>
          <ItemPercentDamageDone amount={this.damage} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get uptimeBar() {
    return uptimeBarSubStatistic(
      this.owner.fight,
      {
        spells: [TALENTS_DRUID.DIRE_FIXATION_TALENT],
        uptimes: this.deps.enemies.getDebuffHistory(SPELLS.DIRE_FIXATION_DEBUFF.id),
      },
      [],
      SubPercentageStyle.RELATIVE,
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_DRUID.DIRE_FIXATION_TALENT} />
        </b>{' '}
        is important to maintain in Single Target situations and even worthwhile to maintain in low
        target count AoE. You should be close to 100% just be playing your rotation normally.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>Dire Fixation uptime</strong>
          {this.uptimeBar}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}
