import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, GetRelatedEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import FlurryEvent from 'analysis/retail/mage/frost/talents/FlurryEvent';
import Enemies from 'parser/shared/modules/Enemies';
import { SpellLink } from 'interface';
import { highlightInefficientCast } from 'interface/report/Results/Timeline/Casts';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import DonutChart from 'parser/ui/DonutChart';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/frost/Guide';
import { TALENTS_MAGE } from 'common/TALENTS';

const colors = ['#3a91c2', '#5fc047', '#a51c37'];
const brainFreeze = <SpellLink spell={TALENTS.BRAIN_FREEZE_TALENT} />;
const thermalVoid = <SpellLink spell={TALENTS_MAGE.THERMAL_VOID_TALENT} />;
const munchedThermalVoidTooltip = <>This cast munched {thermalVoid}.</>;

class Flurry extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    spellUsable: SpellUsable,
  };

  protected enemies!: Enemies;
  protected spellUsable!: SpellUsable;
  flurryEvents: FlurryEvent[] = [];
  hasThermalVoidTalent = false;

  constructor(props: Options) {
    super(props);
    this.hasThermalVoidTalent = this.selectedCombatant.hasTalent(TALENTS_MAGE.THERMAL_VOID_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BRAIN_FREEZE_BUFF),
      this._gainCharge,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.FLURRY_TALENT),
      this.onFlurryCast,
    );
  }

  onFlurryCast(event: CastEvent) {
    const damage: DamageEvent | undefined = GetRelatedEvent(event, 'SpellDamage');
    const hasThermalVoid = this.selectedCombatant.hasBuff(
      SPELLS.THERMAL_VOID_BUFF.id,
      event.timestamp - 10,
    );
    const enemy = damage && this.enemies.getEntity(damage);
    const buffRemove = GetRelatedEvent(event, 'BuffRemove');
    const hasBrainFreeze = buffRemove !== undefined;
    const flurryEvent = new FlurryEvent(event, damage, enemy, hasBrainFreeze, hasThermalVoid);
    this.flurryEvents.push(flurryEvent);

    if (this.hasThermalVoidTalent && hasThermalVoid && hasBrainFreeze) {
      highlightInefficientCast(event, munchedThermalVoidTooltip);
    }
  }

  analyzeFlurry(): { label: React.ReactNode; color: string; value: number }[] {
    const flurryCasts: { label: React.ReactNode; color: string; value: number }[] = [];

    let withBrainFreeze = 0;
    let withoutBrainFreeze = 0;
    let munchedTV = 0;

    this.flurryEvents.forEach((flurry) => {
      if (!flurry.brainFreeze) {
        withoutBrainFreeze += 1;
      } else if (!flurry.thermalVoid) {
        withBrainFreeze += 1;
      } else {
        munchedTV += 1;
      }
    });

    flurryCasts.push({
      label: <>with {brainFreeze}</>,
      color: colors[0],
      value: withBrainFreeze,
    });
    flurryCasts.push({
      label: <>without {brainFreeze}</>,
      color: colors[1],
      value: withoutBrainFreeze,
    });
    if (this.hasThermalVoidTalent) {
      flurryCasts.push({
        label: <>munched {thermalVoid}</>,
        color: colors[2],
        value: munchedTV,
      });
    }
    return flurryCasts;
  }

  _gainCharge() {
    if (this.spellUsable.isOnCooldown(TALENTS.FLURRY_TALENT.id)) {
      this.spellUsable.endCooldown(TALENTS.FLURRY_TALENT.id);
    }
  }

  get guideSubsection(): JSX.Element {
    const flurry = <SpellLink spell={TALENTS.FLURRY_TALENT} />;
    const freezing = <SpellLink spell={SPELLS.FREEZING} />;
    const avoidTVMunching = this.hasThermalVoidTalent && (
      <>, unless you already have {thermalVoid} active</>
    );
    const explanation = (
      <>
        <p>
          {flurry} usage is important to ensure you get the most raw damage and {freezing} out of{' '}
          {brainFreeze}. You should cast it as your highest priority any time you have {brainFreeze}
          {avoidTVMunching}.
        </p>
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
