import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, GetRelatedEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import FlurryEvent from 'analysis/retail/mage/frost/talents/FlurryEvent';
import Enemies from 'parser/shared/modules/Enemies';
import { SpellLink } from 'interface';
import { SpellSeq } from 'parser/ui/SpellSeq';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import DonutChart from 'parser/ui/DonutChart';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/frost/Guide';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { formatNumber } from 'common/format';

const REDUCTION_MS = 30000;
const colors = ['#3a91c2', '#5fc047', '#a51c37'];

class Flurry extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    spellUsable: SpellUsable,
  };

  protected enemies!: Enemies;
  protected spellUsable!: SpellUsable;
  flurryEvents: FlurryEvent[] = [];

  constructor(props: Options) {
    super(props);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BRAIN_FREEZE_BUFF),
      this._gainCharge,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.FLURRY_TALENT),
      this.onFlurryCast,
    );
    this.addEventListener(Events.fightend, this.analyzeFlurry);
  }

  onFlurryCast(event: CastEvent) {
    const damage: DamageEvent | undefined = GetRelatedEvent(event, 'SpellDamage');
    const enemy = damage && this.enemies.getEntity(damage);
    const icicles =
      this.selectedCombatant.getBuff(SPELLS.ICICLES_BUFF.id, event.timestamp)?.stacks || 0;
    const buffRemove = GetRelatedEvent(event, 'BuffRemove');
    const flurryEvent = new FlurryEvent(event, damage, enemy, icicles, buffRemove !== undefined);
    this.flurryEvents.push(flurryEvent);
  }

  analyzeFlurry(): { label: string; color: string; value: number }[] {
    const withBrainFreeze = this.flurryEvents.filter((flurry) => flurry.brainFreeze).length;
    const withoutBrainFreezeGood = this.flurryEvents.filter((flurry) =>
      flurry.noBfGoodCast(),
    ).length;
    const withoutBrainFreezeBad = this.flurryEvents.filter((flurry) => flurry.noBfBadCast()).length;

    const flurryCasts: { label: string; color: string; value: number }[] = [];

    flurryCasts.push({
      label: 'with Brain Freeze (BF)',
      color: colors[0],
      value: withBrainFreeze,
    });
    flurryCasts.push({
      label: 'without BF, 2 or more icicles',
      color: colors[1],
      value: withoutBrainFreezeGood,
    });
    flurryCasts.push({
      label: 'without BF, 0/1 icicles',
      color: colors[2],
      value: withoutBrainFreezeBad,
    });

    return flurryCasts;
  }

  get overlapped() {
    return this.flurryEvents.filter((f) => f.overlapped).length;
  }

  get overlappedThresholds() {
    return {
      actual: this.overlapped,
      isGreaterThan: {
        average: 0,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.overlappedThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink spell={TALENTS.FLURRY_TALENT} /> and applied{' '}
          <SpellLink spell={SPELLS.WINTERS_CHILL} /> while the target still had the{' '}
          <SpellLink spell={SPELLS.WINTERS_CHILL} /> debuff on them {this.overlapped} times. Casting{' '}
          <SpellLink spell={TALENTS.FLURRY_TALENT} /> applies 2 stacks of{' '}
          <SpellLink spell={SPELLS.WINTERS_CHILL} /> to the target so you should always ensure you
          are spending both stacks before you cast <SpellLink spell={TALENTS.FLURRY_TALENT} /> and
          apply <SpellLink spell={SPELLS.WINTERS_CHILL} /> again.
        </>,
      )
        .icon(TALENTS.FLURRY_TALENT.icon)
        .actual(`${formatNumber(actual)} casts`)
        .recommended(`Casting none is recommended`),
    );
  }

  _gainCharge() {
    if (this.spellUsable.isOnCooldown(TALENTS.FLURRY_TALENT.id)) {
      this.spellUsable.reduceCooldown(TALENTS.FLURRY_TALENT.id, REDUCTION_MS);
    }
  }

  get guideSubsection(): JSX.Element {
    const flurry = <SpellLink spell={TALENTS.FLURRY_TALENT} />;
    const glacialSpike = <SpellLink spell={TALENTS.GLACIAL_SPIKE_TALENT} />;
    const frostbolt = <SpellLink spell={SPELLS.FROSTBOLT} />;
    const brainFreeze = <SpellLink spell={TALENTS.BRAIN_FREEZE_TALENT} />;
    const icicles = <SpellLink spell={SPELLS.MASTERY_ICICLES} />;

    const explanation = (
      <>
        <p>
          {flurry} usage is important to make sure you can shatter as much {glacialSpike} as you
          can. You should only hold it after a {frostbolt} hardcast if you don't have {brainFreeze}{' '}
          and you have 0 or 1 {icicles}.
        </p>
        <p>
          <small>
            At 2 or more {icicles} you are always able to shatter {glacialSpike}:
          </small>
        </p>
        <SpellSeq
          spells={[
            SPELLS.FROSTBOLT,
            TALENTS.FLURRY_TALENT,
            TALENTS.ICE_LANCE_TALENT,
            TALENTS.GLACIAL_SPIKE_TALENT,
          ]}
        />
      </>
    );

    const data = (
      <>
        <RoundedPanel>
          <b>{flurry} cast efficiency</b>
          <DonutChart items={this.analyzeFlurry()} />
        </RoundedPanel>
      </>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Flurry',
    );
  }
}

export default Flurry;
