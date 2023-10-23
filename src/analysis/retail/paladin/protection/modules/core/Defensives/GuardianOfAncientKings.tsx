import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/paladin';
import { CastEvent, EventType } from 'parser/core/Events';

import { SpellLink } from 'interface';
import { ReactNode } from 'react';
import {
  buff,
  MajorDefensiveBuff,
  absoluteMitigation,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TALENTS from 'common/TALENTS/paladin';
import Spell from 'common/SPELLS/Spell';

const hasGuardianOfAncientQueens = (options: Options) =>
  options.owner.normalizedEvents
    .filter((event): event is CastEvent => event.type === EventType.Cast)
    .some((event) => event.ability.guid === SPELLS.GUARDIAN_OF_ANCIENT_KINGS_QUEEN.id);

const getCast = (options: Options) =>
  hasGuardianOfAncientQueens(options)
    ? SPELLS.GUARDIAN_OF_ANCIENT_KINGS_QUEEN
    : TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT;

const getBuff = (options: Options) =>
  hasGuardianOfAncientQueens(options)
    ? SPELLS.GUARDIAN_OF_ANCIENT_KINGS_QUEEN
    : TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT;

export default class GuardianOfAncientKings extends MajorDefensiveBuff {
  static dependencies = {
    ...MajorDefensiveBuff.dependencies,
  };

  private goakSpell: Spell;

  constructor(options: Options) {
    super(getCast(options), buff(getBuff(options)), options);
    this.goakSpell = getCast(options);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
  }

  private recordDamage(event: DamageEvent) {
    if (!this.defensiveActive || event.sourceIsFriendly) {
      return;
    }
    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, 0.5),
    });
  }

  description(): ReactNode {
    return (
      <p>
        <SpellLink spell={this.goakSpell} /> reduces the damage you take by 50%. This grants
        incredible survivablity and makes it your biggest defensive cooldown.
      </p>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.GENERAL} />;
  }
}
