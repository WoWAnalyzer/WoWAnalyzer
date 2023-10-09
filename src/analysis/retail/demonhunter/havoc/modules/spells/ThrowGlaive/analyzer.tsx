import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/demonhunter';
import TALENTS from 'common/TALENTS/demonhunter';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import SpellLink from 'interface/SpellLink';
import { AcceleratingBladeExplanation } from 'analysis/retail/demonhunter/havoc/modules/spells/ThrowGlaive/AcceleratingBladeExplanation';
import { ExplanationSection } from 'analysis/retail/demonhunter/shared/guide/CommonComponents';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events, { FightEndEvent, UpdateSpellUsableEvent } from 'parser/core/Events';
import { BadColor, GoodColor, OkColor } from 'interface/guide';
import DonutChart, { Item } from 'parser/ui/DonutChart';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';

interface TimeAtCharge {
  chargesAvailable: number;
  startTimestamp: number;
  endTimestamp?: number;
}

export default class ThrowGlaive extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  private readonly timeAtCharges: TimeAtCharge[] = [];
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.SOULSCAR_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS.FURIOUS_THROWS_TALENT);
    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(SPELLS.THROW_GLAIVE_HAVOC),
      this.onUpdateSpellUsable,
    );
    this.addEventListener(Events.fightend, this.finalize);
  }

  get chart() {
    const timeAtSpecific = this.timeAtCharges.reduce<Record<number, number>>(
      (acc, timeAtCharge) => {
        const chargesAmount = timeAtCharge.chargesAvailable;
        const existingDuration = acc[chargesAmount] ?? 0;
        const durationToAdd =
          (timeAtCharge.endTimestamp ?? this.owner.fight.end_time) - timeAtCharge.startTimestamp;
        return { ...acc, [chargesAmount]: existingDuration + durationToAdd };
      },
      {},
    );

    const zeroChargesSeconds = Math.round((timeAtSpecific[0] ?? 0) / 1000);
    const oneChargeSeconds = Math.round((timeAtSpecific[1] ?? 0) / 1000);
    const items: Item[] = [
      {
        color: GoodColor,
        label: '0 Charges',
        value: zeroChargesSeconds,
        valueTooltip: <>{zeroChargesSeconds} seconds</>,
      },
      {
        color: OkColor,
        label: '1 Charge',
        value: oneChargeSeconds,
        valueTooltip: <>{oneChargeSeconds} seconds</>,
      },
    ];
    if (this.selectedCombatant.hasTalent(TALENTS.MASTER_OF_THE_GLAIVE_TALENT)) {
      const twoChargesSeconds = Math.round((timeAtSpecific[2] ?? 0) / 1000);
      items.push({
        color: BadColor,
        label: '2 Charges',
        value: twoChargesSeconds,
        valueTooltip: <>{twoChargesSeconds} seconds</>,
      });
    }

    return <DonutChart items={items} />;
  }

  guideSubsection(): JSX.Element | null {
    if (!this.active) {
      return null;
    }
    const explanation = (
      <>
        <ExplanationSection>
          <p>
            <strong>
              <SpellLink spell={SPELLS.THROW_GLAIVE_HAVOC} />
            </strong>{' '}
            throws a glaive at an enemy within 30 yards for a small amount of physical damage and
            then bounces to the nearest enemy within 10 yards of the target.
          </p>
        </ExplanationSection>
        <ExplanationSection>
          <p>
            <SpellLink spell={SPELLS.THROW_GLAIVE_HAVOC} /> gains significant value in your rotation
            when you take <SpellLink spell={TALENTS.SOULSCAR_TALENT} /> and{' '}
            <SpellLink spell={TALENTS.FURIOUS_THROWS_TALENT} />. It also gains value from the below
            talents.
          </p>
          <ul>
            {this.selectedCombatant.hasTalent(TALENTS.BOUNCING_GLAIVES_TALENT) && (
              <li>
                <SpellLink spell={TALENTS.BOUNCING_GLAIVES_TALENT} />
              </li>
            )}
            {this.selectedCombatant.hasTalent(TALENTS.MASTER_OF_THE_GLAIVE_TALENT) && (
              <li>
                <SpellLink spell={TALENTS.MASTER_OF_THE_GLAIVE_TALENT} />
              </li>
            )}
            {this.selectedCombatant.hasTalent(TALENTS.SERRATED_GLAIVE_TALENT) && (
              <li>
                <SpellLink spell={TALENTS.SERRATED_GLAIVE_TALENT} />
              </li>
            )}
            {this.selectedCombatant.hasTalent(TALENTS.BURNING_WOUND_TALENT) && (
              <li>
                <SpellLink spell={TALENTS.BURNING_WOUND_TALENT} />
              </li>
            )}
            <AcceleratingBladeExplanation />
          </ul>
        </ExplanationSection>
      </>
    );
    const data = (
      <div>
        <RoundedPanel>
          <p>
            Time spent at{' '}
            <strong>
              <SpellLink spell={SPELLS.THROW_GLAIVE_HAVOC} />
            </strong>{' '}
            charges
          </p>
          {this.chart}
        </RoundedPanel>
      </div>
    );

    return (
      <ExplanationAndDataSubSection explanation={explanation} data={data} title="Throw Glaive" />
    );
  }

  private onUpdateSpellUsable(event: UpdateSpellUsableEvent) {
    const existingSpellUsable = this.timeAtCharges.at(-1);
    if (existingSpellUsable && !existingSpellUsable.endTimestamp) {
      existingSpellUsable.endTimestamp = event.timestamp;
      this.timeAtCharges.push({
        chargesAvailable: event.chargesAvailable,
        startTimestamp: event.timestamp,
      });
    } else {
      this.timeAtCharges.push({
        chargesAvailable: event.chargesAvailable,
        startTimestamp: event.timestamp,
      });
    }
  }

  private finalize(event: FightEndEvent) {
    const existingSpellUsable = this.timeAtCharges.at(-1);
    if (existingSpellUsable && !existingSpellUsable.endTimestamp) {
      existingSpellUsable.endTimestamp = event.timestamp;
    }
  }
}
