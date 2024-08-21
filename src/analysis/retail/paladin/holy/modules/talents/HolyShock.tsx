import { TALENTS_PALADIN } from 'common/TALENTS';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import Analyzer from 'parser/core/Analyzer';
import talents from 'common/TALENTS/paladin';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { ResourceLink, SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../guide/Guide';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

class HolyShock extends Analyzer {
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={talents.HOLY_SHOCK_TALENT} />
        </b>{' '}
        is the bread and butter of Holy Paladin. Is does tremendous amounts of healing thanks to
        talents like <SpellLink spell={talents.AWESTRUCK_TALENT} />,{' '}
        <SpellLink spell={talents.LIGHT_OF_THE_MARTYR_TALENT} />
        , <SpellLink spell={talents.DIVINE_GLIMPSE_TALENT} />,{' '}
        <SpellLink spell={talents.RECLAMATION_TALENT} /> and{' '}
        <SpellLink spell={talents.OVERFLOWING_LIGHT_TALENT} />.<br />
        What's more, it is made highly available by{' '}
        <SpellLink spell={talents.LIGHTS_CONVICTION_TALENT} />
        , <SpellLink spell={talents.GLORIOUS_DAWN_TALENT} />,{' '}
        <SpellLink spell={talents.CRUSADERS_MIGHT_TALENT} /> and{' '}
        <SpellLink spell={talents.IMBUED_INFUSIONS_TALENT} />.<br />
        Lastly, it is your only way of proccing <SpellLink spell={SPELLS.INFUSION_OF_LIGHT} /> and
        it generates one <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} />.<br />
        <strong>Use it on cooldown !</strong>
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={talents.HOLY_SHOCK_TALENT} /> cast efficiency
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
        spellId={TALENTS_PALADIN.HOLY_SHOCK_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default HolyShock;
