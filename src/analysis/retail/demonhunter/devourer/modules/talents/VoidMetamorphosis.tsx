import type { JSX } from 'react';
import SPELLS from 'common/SPELLS/demonhunter';
import { ResourceLink, SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';

class VoidMetamorphosis extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT);
  }

  get buffHistory() {
    return this.selectedCombatant.getBuffHistory(SPELLS.VOID_METAMORPHOSIS_BUFF.id);
  }

  guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <SpellLink spell={TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT} /> is a potent cooldown
          that greatly enhances some of your abilities. Notably <SpellLink spell={SPELLS.CULL} />.
          You need to farm souls to enter{' '}
          <SpellLink spell={TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT} />.
          <br />
        </p>
        <p>
          While <SpellLink spell={TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT} /> has no fixed
          duration, it constantly drains <ResourceLink id={RESOURCE_TYPES.FURY.id} />. Once you run
          out of it, it ends. Casting spells slows down this process, which means active time during{' '}
          <SpellLink spell={TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT} /> is particularly
          important.
        </p>
        <p>
          <strong>Try to maximize uptime.</strong>
        </p>
      </>
    );
    const data = (
      <RoundedPanel>
        <p>
          <strong>
            <SpellLink spell={SPELLS.VOID_METAMORPHOSIS_BUFF} />
          </strong>{' '}
          uptime
        </p>
        {uptimeBarSubStatistic(this.owner.fight, {
          spells: [SPELLS.VOID_METAMORPHOSIS_BUFF],
          uptimes: this.buffHistory.map((buff) => ({
            start: buff.start,
            end: buff.end ?? this.owner.fight.end_time,
          })),
        })}
      </RoundedPanel>
    );
    return (
      <ExplanationAndDataSubSection
        explanation={explanation}
        data={data}
        explanationPercent={GUIDE_CORE_EXPLANATION_PERCENT}
        title="Void Metamorphosis"
      />
    );
  }
}

export default VoidMetamorphosis;
