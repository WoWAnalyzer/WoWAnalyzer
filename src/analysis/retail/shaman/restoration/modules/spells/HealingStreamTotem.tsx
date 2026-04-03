import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS, { TALENTS_SHAMAN } from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';

class HealingStreamTotem extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  constructor(options: Options) {
    super(options);
    this.active = true;
  }

  get guideSubsection(): JSX.Element {
    let explanation;
    if (this.selectedCombatant.hasTalent(TALENTS.SURGING_TOTEM_TALENT)) {
      explanation = (
        <p>
          <b>
            <SpellLink spell={TALENTS_SHAMAN.HEALING_STREAM_TOTEM_RESTORATION_TALENT} />
          </b>{' '}
          is a very efficient heal that should be used as much as possible. It costs very little
          mana and does a considerable amount of healing over its duration. It will also cast a free{' '}
          <SpellLink spell={TALENTS.CHAIN_HEAL_TALENT} /> every time you use it and has a chance to
          apply <SpellLink spell={TALENTS.EARTHLIVING_WEAPON_TALENT} /> every time it heals a player
        </p>
      );
    } else {
      explanation = (
        <p>
          <b>
            <SpellLink spell={TALENTS_SHAMAN.HEALING_STREAM_TOTEM_RESTORATION_TALENT} />
          </b>{' '}
          is a very efficient heal that should be used as much as possible. It costs very little
          mana and does a considerable amount of healing over its duration. Your active Farseer
          ancestors will cast a <SpellLink spell={SPELLS.CALL_OF_THE_ANCESTORS_CHAIN_HEAL} /> every
          time you use it. While it is not a very prominent source of healing for farseer it is
          still very good due to the low mana cost for what it brings.
        </p>
      );
    }

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_SHAMAN.HEALING_STREAM_TOTEM_RESTORATION_TALENT} /> cast
            efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()}
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spell={SPELLS.HEALING_STREAM_TOTEM}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        useThresholds
      />
    );
  }
}

export default HealingStreamTotem;
