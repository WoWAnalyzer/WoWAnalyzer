import Analyzer, { Options } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_MONK } from 'common/TALENTS';

import { LIFE_COCOON_HEALING_BOOST } from '../../constants';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { SpellLink } from 'interface';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';

class LifeCocoon extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  healing: number = 0;
  protected combatants!: Combatants;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.heal, this.cocoonBuff);
  }

  cocoonBuff(event: HealEvent) {
    // Life Cocoon works on any HoT that has this flag checked even if they don't come from the mistweaver themselves
    if (!event.tick) {
      return;
    }

    const target = this.combatants.players[event.targetID];

    if (!target) {
      return;
    }

    if (target.hasBuff(TALENTS_MONK.LIFE_COCOON_TALENT.id, event.timestamp, 0, 0)) {
      this.healing += calculateEffectiveHealing(event, LIFE_COCOON_HEALING_BOOST);
    }
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink id={TALENTS_MONK.LIFE_COCOON_TALENT} />
        </b>{' '}
        is a strong external cooldown that has many supporting talents in{' '}
        <SpellLink id={TALENTS_MONK.MISTS_OF_LIFE_TALENT} />,{' '}
        {/*<SpellLink id={TALENTS_MONK.CHRYSALIS_TALENT}/>*/} Chrysalis, and{' '}
        <SpellLink id={TALENTS_MONK.CALMING_COALESCENCE_TALENT} />, and is important as often as
        possible while still getting good value from it. Similar to your other cooldowns, this just
        means don't hold it for so long that you miss out on an entire cast.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink id={TALENTS_MONK.LIFE_COCOON_TALENT} /> cast efficiency
          </strong>
          {this.subStatistic()}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS_MONK.LIFE_COCOON_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        useThresholds
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(70)}
        category={STATISTIC_CATEGORY.THEORYCRAFT}
        size="flexible"
        tooltip={<>Life Cocoon boosts HoTs from other players as wells as your own.</>}
      >
        <TalentSpellText talent={TALENTS_MONK.LIFE_COCOON_TALENT}>
          <ItemHealingDone amount={this.healing} />
          <br />
          <small>Increased HoT Healing</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default LifeCocoon;
