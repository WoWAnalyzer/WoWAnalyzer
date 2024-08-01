import AbilityTracker from 'analysis/retail/priest/shadow/modules/core/AbilityTracker';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import ItemInsanityGained from 'analysis/retail/priest/shadow/interface/ItemInsanityGained';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, ResourceChangeEvent, CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellLink } from 'interface';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

class ShadowCrash extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  castEntries: BoxRowEntry[] = [];

  damage = 0;
  insanityGained = 0;
  totalTargetsHit = 0;
  totalCasts = 0;

  recentHits = 0;
  recentSCTimestamp = 0;

  shadowCrash1 = this.selectedCombatant.hasTalent(TALENTS.SHADOW_CRASH_1_SHADOW_TALENT);
  shadowCrash2 = this.selectedCombatant.hasTalent(TALENTS.SHADOW_CRASH_2_SHADOW_TALENT);

  constructor(options: Options) {
    super(options);
    this.active = this.shadowCrash1 || this.shadowCrash2;
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_CRASH_TALENT_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_CRASH_1_SHADOW_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_CRASH_2_SHADOW_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_CRASH_1_SHADOW_TALENT),
      this.onEnergize,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_CRASH_2_SHADOW_TALENT),
      this.onEnergize,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  get abilityVersion() {
    if (this.shadowCrash1) {
      return this.abilityTracker.getAbility(TALENTS.SHADOW_CRASH_1_SHADOW_TALENT.id).casts;
    }
    if (this.shadowCrash2) {
      return this.abilityTracker.getAbility(TALENTS.SHADOW_CRASH_2_SHADOW_TALENT.id).casts;
    } else {
      return 1;
    } //this should never be reached
  }

  get averageTargetsHit() {
    return this.totalTargetsHit / this.abilityVersion;
  }

  onDamage(event: DamageEvent) {
    this.recentHits += 1;
    this.totalTargetsHit += 1;
    this.damage += event.amount + (event.absorbed || 0);
  }

  onCast(event: CastEvent) {
    this._tallyLastCast(); // make sure the previous cast is closed out
    this._trackNewCast(event);
  }

  onEnergize(event: ResourceChangeEvent) {
    this.insanityGained += event.resourceChange;
  }

  onFightEnd() {
    this._tallyLastCast(); // make sure the last cast is closed out
  }

  private _trackNewCast(event: CastEvent) {
    this.recentHits = 0;
    this.recentSCTimestamp = event.timestamp;
  }

  private _tallyLastCast() {
    this.totalCasts += 1;
    if (this.totalCasts === 1) {
      return; // there is no last cast
    }

    // add cast perf entry
    const value = this.recentHits >= 1 ? QualitativePerformance.Good : QualitativePerformance.Fail;
    const tooltip = (
      <>
        @ <strong>{this.owner.formatTimestamp(this.recentSCTimestamp)}</strong>, Hits:{' '}
        <strong>{this.recentHits}</strong>
      </>
    );
    this.castEntries.push({ value, tooltip });
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`Average targets hit: ${this.averageTargetsHit.toFixed(1)}`}
      >
        <BoringSpellValueText spell={TALENTS.SHADOW_CRASH_1_SHADOW_TALENT}>
          <>
            <div>
              <ItemDamageDone amount={this.damage} />
            </div>
            <div>
              <ItemInsanityGained amount={this.insanityGained} />
            </div>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    if (this.damage === 0) {
      //if ShadowCrash doesn't deal damage, this section isn't needed.
      return <br />;
    }

    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.SHADOW_CRASH_1_SHADOW_TALENT} />
        </b>{' '}
        deals damage and applies <SpellLink spell={SPELLS.VAMPIRIC_TOUCH} /> to targets it hits.
        <br />
        Use <SpellLink spell={TALENTS.SHADOW_CRASH_1_SHADOW_TALENT} /> to apply your DoTs, and
        generate insanity. You may want to hold this ability if it will allow you to hit more
        targets.
      </p>
    );

    const data = (
      <div>
        <strong>Shadow Crash Casts</strong>
        <small>
          {' '}
          - Shows number of targets hit for each Shadow Crash. Mouseover boxes for details.
        </small>
        <PerformanceBoxRow values={this.castEntries} />
      </div>
    );

    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default ShadowCrash;
