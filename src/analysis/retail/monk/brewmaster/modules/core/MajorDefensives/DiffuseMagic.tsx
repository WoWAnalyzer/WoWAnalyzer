import talents from 'common/TALENTS/monk';
import MAGIC_SCHOOLS, { color } from 'game/MAGIC_SCHOOLS';
import { SpellLink } from 'interface';
import {
  absoluteMitigation,
  buff,
  MajorDefensiveBuff,
  Mitigation,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { MitigationSegment } from 'interface/guide/components/MajorDefensives/MitigationSegments';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { ReactNode } from 'react';

export class DiffuseMagic extends MajorDefensiveBuff {
  constructor(options: Options) {
    super(talents.DIFFUSE_MAGIC_TALENT, buff(talents.DIFFUSE_MAGIC_TALENT), options);

    this.active = this.selectedCombatant.hasTalent(talents.DIFFUSE_MAGIC_TALENT);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
  }

  private recordDamage(event: DamageEvent) {
    if (!this.defensiveActive || event.ability.type === MAGIC_SCHOOLS.ids.PHYSICAL) {
      return;
    }

    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, 0.6),
    });
  }

  mitigationSegments(mit: Mitigation): MitigationSegment[] {
    const segments = super.mitigationSegments(mit);
    segments[0].color = color(MAGIC_SCHOOLS.ids.ARCANE);

    return segments;
  }

  description(): ReactNode {
    return (
      <>
        <p>
          <SpellLink spell={talents.DIFFUSE_MAGIC_TALENT} /> is a strong defensive against{' '}
          <em>Magic damage</em>, but useless against Physical. This makes it a niche spell that is
          sometimes the best spell in your kit, and sometimes not even talented.
        </p>
        <p>
          It also has the ability to transfer some debuffs on you to their caster, but most boss
          abilities are immune.
        </p>
      </>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.TALENTS} />;
  }
}
