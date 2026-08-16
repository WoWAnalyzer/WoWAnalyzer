import type { JSX } from 'react';
import TALENTS from 'common/TALENTS/mage';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Analyzer from 'parser/core/Analyzer';
import GuideSection from 'interface/guide/components/GuideSection';
import { ManaBracketHeatmap } from 'interface/guide/components';
import ManaValues from 'parser/shared/modules/ManaValues';
import ArcaneSurge from '../analyzers/ArcaneSurge';
import TouchOfTheMagi from '../analyzers/TouchOfTheMagi';
import Events, { CastEvent } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Spell from 'common/SPELLS/Spell';

const SPELL_COLORS = {
  ARCANE_SURGE: '#db35acff', // Pinkish purple
  EVOCATION: '#10B981', // Green
  TOUCH_OF_THE_MAGI: '#F59E0B', // Orange
} as const;

class ManaChart extends Analyzer {
  static dependencies = {
    manaValues: ManaValues,
    arcaneSurge: ArcaneSurge,
    touchOfTheMagi: TouchOfTheMagi,
  };

  protected manaValues!: ManaValues;
  protected arcaneSurge!: ArcaneSurge;
  protected touchOfTheMagi!: TouchOfTheMagi;

  private manaUpdates: Array<{ timestamp: number; current: number; max: number; used: number }> =
    [];
  private evocationCasts: Array<{ timestamp: number; spell: Spell }> = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  onCast(event: CastEvent) {
    if (event.prepull || !event.classResources) {
      return;
    }

    const manaResource = event.classResources.find(
      (resource) => resource.type === RESOURCE_TYPES.MANA.id,
    );

    if (manaResource) {
      const currentMana = manaResource.amount - (manaResource.cost || 0);
      this.manaUpdates.push({
        timestamp: event.timestamp,
        current: currentMana,
        max: manaResource.max,
        used: manaResource.cost || 0,
      });
    }

    if (event.ability.guid === TALENTS.EVOCATION_TALENT.id) {
      this.evocationCasts.push({
        timestamp: event.timestamp,
        spell: TALENTS.EVOCATION_TALENT,
      });
    }
  }

  get guideSubsection(): JSX.Element {
    const arcaneSurge = <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />;
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const evocation = <SpellLink spell={TALENTS.EVOCATION_TALENT} />;
    const arcaneBarrage = <SpellLink spell={SPELLS.ARCANE_BARRAGE} />;

    const explanation = (
      <>
        <b>Mana Management</b> plays a large role in your Arcane rotation, but is relatively simple
        to manage if you are doing your rotation properly. However, if you are hanging onto your{' '}
        {arcaneCharge} stacks for too long, you can easily burn through all your mana without
        realizing it. If you are having trouble managing your mana, focus on the below items first:
        <ul>
          <li>Focus on your {arcaneBarrage} usage as that will help regulate your mana.</li>
          <li>Make sure you are using {arcaneSurge} as quickly as possible.</li>
          <li>
            If you are still struggling, consider taking {evocation} until you get used to the
            rotation and no longer need it.
          </li>
        </ul>
      </>
    );

    const arcaneSurgeCasts = this.arcaneSurge.surgeData.map((cast) => cast.cast);
    const evocationCasts = this.evocationCasts.map((cast) => cast.timestamp);

    return (
      <GuideSection
        spell={TALENTS.EVOCATION_TALENT}
        title="Mana Management"
        explanation={explanation}
        verticalLayout
      >
        <ManaBracketHeatmap
          manaUpdates={this.manaUpdates}
          startTime={this.owner.fight.start_time}
          endTime={this.owner.fight.end_time}
          bucketCount={25}
          markerGroups={[
            {
              label: 'Arcane Surge',
              color: SPELL_COLORS.ARCANE_SURGE,
              timestamps: arcaneSurgeCasts,
            },
            {
              label: 'Evocation',
              color: SPELL_COLORS.EVOCATION,
              timestamps: evocationCasts,
            },
          ]}
        />
      </GuideSection>
    );
  }
}

export default ManaChart;
