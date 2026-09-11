import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent } from 'parser/core/Events';
import { SubSection } from 'interface/guide';
import Explanation from 'interface/guide/components/Explanation';
import CooldownGrid from 'interface/CooldownGrid/CooldownGrid';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { INNER_FLAME_STASIS, INNER_FLAME_DREAMFLIGHT } from '../../constants';

interface InnerFlameWindow {
  start: number;
  end: number;
  sourceSpellId: number;
  casts: CastEvent[];
}

class InnerFlame extends Analyzer {
  windows: InnerFlameWindow[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.INNER_FLAME_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.INNER_FLAME),
      this.onApplyBuff,
    );
  }

  onApplyBuff(event: ApplyBuffEvent) {
    const duration = this.selectedCombatant.hasTalent(TALENTS_EVOKER.STASIS_TALENT)
      ? INNER_FLAME_STASIS
      : INNER_FLAME_DREAMFLIGHT;
    if (!duration) {
      return;
    }

    this.windows.push({
      start: event.timestamp,
      end: event.timestamp + duration,
      sourceSpellId: event.ability.guid,
      casts: [],
    });
  }

  get guideSubsection(): JSX.Element {
    const items = this.windows.map((window) => {
      const perf = QualitativePerformance.Good;
      const spellCounts = new Map<number, number>();
      window.casts.forEach((cast) => {
        spellCounts.set(cast.ability.guid, (spellCounts.get(cast.ability.guid) ?? 0) + 1);
      });

      return {
        perf,
        checklistItems: [],
        range: { start: window.start, end: window.end },
      };
    });

    return (
      <SubSection title="Inner Flame">
        <Explanation>
          <p>
            <SpellLink spell={TALENTS_EVOKER.INNER_FLAME_TALENT} /> increases all your healing over
            time by 50% for the next 15 seconds after using{' '}
            <SpellLink spell={TALENTS_EVOKER.STASIS_TALENT} /> or 20 seconds after using{' '}
            <SpellLink spell={TALENTS_EVOKER.DREAM_FLIGHT_TALENT} />. It also increases the chance
            of triggering <SpellLink spell={TALENTS_EVOKER.ESSENCE_BURST_PRESERVATION_TALENT} /> by
            100%.
          </p>
          <p>
            While this effect is active, you should maximize your{' '}
            <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> and{' '}
            <SpellLink spell={TALENTS_EVOKER.REVERSION_TALENT} /> healing.{' '}
            <SpellLink spell={SPELLS.EMERALD_BLOSSOM} /> is also a very good cast as{' '}
            <SpellLink spell={TALENTS_EVOKER.CONSUME_FLAME_TALENT} /> also benefits from the
            increase.
          </p>
        </Explanation>
        <CooldownGrid
          label={<SpellLink spell={TALENTS_EVOKER.INNER_FLAME_TALENT} />}
          timeline={{
            cooldowns: [TALENTS_EVOKER.DREAM_FLIGHT_TALENT, TALENTS_EVOKER.STASIS_TALENT],
          }}
          items={items}
        />
      </SubSection>
    );
  }
}

export default InnerFlame;
