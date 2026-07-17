import type { JSX } from 'react';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink, SpellLink } from 'interface';
import CastOverview from 'interface/guide/components/CastOverview';
import GuideSection from 'interface/guide/components/GuideSection';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../guide/Guide';

/**
 * Judgment is a filler pressed for damage and Holy Power, not a healing cooldown, so there
 * is nothing here about cast efficiency: grading it on that would tell players to cast the
 * lowest priority thing in their kit more often.
 */
class Judgment extends Analyzer {
  casts = 0;
  damage = 0;
  holyPowerGenerated = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.JUDGMENT_CAST_HOLY),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.JUDGMENT_CAST_HOLY),
      this.onDamage,
    );
    // The energize is logged under its own spell id rather than the cast's, so accept either.
    this.addEventListener(
      Events.resourcechange
        .by(SELECTED_PLAYER)
        .spell([SPELLS.JUDGMENT_HP_ENERGIZE, SPELLS.JUDGMENT_CAST_HOLY]),
      this.onEnergize,
    );
  }

  onCast() {
    this.casts += 1;
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onEnergize(event: ResourceChangeEvent) {
    if (event.resourceChangeType !== RESOURCE_TYPES.HOLY_POWER.id) {
      return;
    }
    this.holyPowerGenerated += event.resourceChange - event.waste;
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={SPELLS.JUDGMENT_CAST_HOLY} />
          </b>{' '}
          is a filler you cast for damage, and for the{' '}
          <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} /> it generates. It is not worth holding a
          global open for, and not worth casting over anything that heals when healing is needed.
        </p>
        <p>
          An <SpellLink spell={SPELLS.INFUSION_OF_LIGHT} /> proc is better spent on{' '}
          <SpellLink spell={SPELLS.FLASH_OF_LIGHT} />, but spending it here beats letting it expire
          when nobody needs the healing.
        </p>
      </>
    );

    const stats = [
      {
        value: `${this.casts}`,
        label: 'Casts',
        tooltip: (
          <>
            There is no target to hit here. How often you cast{' '}
            <SpellLink spell={SPELLS.JUDGMENT_CAST_HOLY} /> depends on how much healing the fight
            asked of you.
          </>
        ),
      },
      {
        value: formatNumber(this.damage),
        label: 'Damage',
        tooltip: (
          <>
            Damage done by <SpellLink spell={SPELLS.JUDGMENT_CAST_HOLY} />, the main reason to press
            it.
          </>
        ),
      },
      {
        value: `${this.holyPowerGenerated}`,
        label: 'Holy Power Generated',
        tooltip: (
          <>
            <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} /> generated across {this.casts} casts,
            excluding any that was wasted by capping.
          </>
        ),
      },
    ];

    return (
      <GuideSection explanation={explanation} explanationPercent={GUIDE_CORE_EXPLANATION_PERCENT}>
        <CastOverview spell={SPELLS.JUDGMENT_CAST_HOLY} title="Judgment Overview" stats={stats} />
      </GuideSection>
    );
  }
}

export default Judgment;
