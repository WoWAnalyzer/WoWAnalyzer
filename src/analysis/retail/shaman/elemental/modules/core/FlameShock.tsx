import SpellLink from 'interface/SpellLink';
import BaseFlameShock from '../../../shared/core/FlameShock';
import { Options } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { formatPercentage } from 'common/format';
import UptimeStackBar from 'parser/ui/UptimeStackBar';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_EXPLANATION_PERCENT_WIDTH } from '../../constants';
import { SubSection } from 'interface/guide';

class FlameShock extends BaseFlameShock {
  constructor(options: Options) {
    super(options);
  }

  get guideSubsection() {
    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={SPELLS.FLAME_SHOCK} />
          </b>{' '}
          is one of the best sources of damage for it's cast time. Additionally, it makes every{' '}
          <SpellLink spell={TALENTS.LAVA_BURST_TALENT} /> into a critical hit. This should always be
          up on your target at low target counts so every{' '}
          <SpellLink spell={TALENTS.LAVA_BURST_TALENT} /> critically hits.
        </p>
        <p>
          Every <SpellLink spell={SPELLS.FLAME_SHOCK} /> damage tick has a chance to proc{' '}
          <SpellLink spell={SPELLS.LAVA_SURGE} />, which reset the cooldown on{' '}
          <SpellLink spell={TALENTS.LAVA_BURST_TALENT} /> and make your next cast instant.
        </p>
      </>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={SPELLS.FLAME_SHOCK} /> uptime
          </strong>
          <div className="flex-main">
            {formatPercentage(this.uptime)}% <small>uptime</small>
            <div
              style={{
                height: '24px' /* UptimeStackBar floats and doesn't have an intrinsic height */,
              }}
            >
              {
                // TODO: move this to a BuffStackGraph.  That's a bit more
                // complicated as that is built to work with a BuffStackTracker.
                // However, this is a debuff count!
              }
              <UptimeStackBar
                start={this.owner.info.fightStart}
                end={this.owner.info.fightEnd}
                barColor="#4ec04e"
                timeTooltip
                {...this.getDebuffStackHistory()}
              />
            </div>
          </div>
          {this.badLavaBursts > 0 && (
            <div className="flex-main">
              {this.badLavaBursts} <SpellLink spell={TALENTS.LAVA_BURST_TALENT} /> without{' '}
              <SpellLink spell={SPELLS.FLAME_SHOCK} />
            </div>
          )}
        </RoundedPanel>
      </div>
    );

    return (
      <SubSection
        title={
          <>
            <SpellLink spell={SPELLS.FLAME_SHOCK} />
          </>
        }
      >
        <ExplanationAndDataSubSection
          explanationPercent={GUIDE_EXPLANATION_PERCENT_WIDTH}
          explanation={explanation}
          data={data}
        />
      </SubSection>
    );
  }
}

export default FlameShock;
