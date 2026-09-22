import { Talent } from 'common/TALENTS/types';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { Ability, CastEvent, DispelEvent, EventType, HealEvent } from 'parser/core/Events';

import CooldownGrid from 'interface/CooldownGrid/CooldownGrid';
import Explanation from 'interface/guide/components/Explanation';
import { SubSection } from 'interface/guide';
import { CooldownExpandableItem } from 'interface/guide/components/CooldownExpandable';

interface RevivalCastTracker {
  timeStamp: number; // time of cast
  dispelled: Ability[]; // debuffs removed by this cast
}

class Revival extends Analyzer {
  castTracker: RevivalCastTracker[] = [];

  activeTalent!: Talent;
  revivalHealing = 0;
  revivalOverhealing = 0;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_MONK.RESTORAL_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_MONK.REVIVAL_TALENT);

    this.activeTalent = this.getRevivalTalent();
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(this.activeTalent),
      this.handleCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(this.activeTalent),
      this.handleRevivalDirect,
    );
    this.addEventListener(
      Events.dispel.by(SELECTED_PLAYER).spell(this.activeTalent),
      this.handleDispel,
    );
  }

  getRevivalTalent() {
    return this.selectedCombatant.hasTalent(TALENTS_MONK.RESTORAL_TALENT)
      ? TALENTS_MONK.RESTORAL_TALENT
      : TALENTS_MONK.REVIVAL_TALENT;
  }

  handleCast(event: CastEvent) {
    this.castTracker.push({ timeStamp: event.timestamp, dispelled: [] });
  }

  handleDispel(event: DispelEvent) {
    const cast = this.castTracker.at(-1);
    if (!cast || event.timestamp - cast.timeStamp > 1000) {
      return;
    }
    cast.dispelled.push(event.extraAbility);
  }

  handleRevivalDirect(event: HealEvent) {
    this.revivalHealing += event.amount + (event.absorbed || 0);
    this.revivalOverhealing += event.overheal || 0;
  }

  get avgHealingPerCast() {
    return this.revivalHealing / this.castTracker.length;
  }

  get avgRawPerCast() {
    return (this.revivalHealing + this.revivalOverhealing) / this.castTracker.length;
  }

  get guideCastBreakdown() {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={this.activeTalent} />
        </strong>{' '}
        is a fairly straightforward cooldown that should be used to heal burst damage events and/or
        dispel debuffs from your group.
      </p>
    );

    const items = this.castTracker.map((cast) => {
      const counts = new Map<number, { ability: Ability; count: number }>();
      cast.dispelled.forEach((ability) => {
        const entry = counts.get(ability.guid) ?? { ability, count: 0 };
        entry.count += 1;
        counts.set(ability.guid, entry);
      });
      // informational only
      const dispelItem: CooldownExpandableItem = {
        label: <>Dispelled</>,
        details: (
          <>
            {[...counts.values()].map(({ ability, count }, ix) => (
              <span key={ability.guid}>
                {ix > 0 && ', '}
                <SpellLink spell={ability.guid} />
                {count > 1 && <> &times;{count}</>}
              </span>
            ))}
          </>
        ),
      };

      return {
        checklistItems: counts.size > 0 ? [dispelItem] : [],
        // 1000ms added just to generate the end window as revival is fully realized instantly
        range: {
          start: cast.timeStamp,
          end: Math.min(cast.timeStamp + 1000, this.owner.fight.end_time),
        },
      };
    });

    return (
      <SubSection title={<SpellLink spell={this.activeTalent} />}>
        <Explanation>{explanation}</Explanation>
        <CooldownGrid
          label={<SpellLink spell={this.activeTalent} />}
          table={{
            type: EventType.Heal,
            abilityFilter: [this.activeTalent.id],
            omitOtherRow: true,
          }}
          items={items}
        />
      </SubSection>
    );
  }
}

export default Revival;
