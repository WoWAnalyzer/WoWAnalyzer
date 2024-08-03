import { GuideProps } from 'interface/guide';
import { GUIDE_EXPLANATION_PERCENT_WIDTH } from '../constants';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS/shaman';
import UptimeStackBar from 'parser/ui/UptimeStackBar';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { formatPercentage } from 'common/format';
import ElementalCombatLogParser from '../CombatLogParser';
import { FlameShock } from '../../shared';

/**
 * The guide sub-section about Flame Shock.
 * The flameshock module is shared with all shaman specs so this element is the
 * guide tailored to elemental shamans.
 */
export const FlameShockSubSection = ({
  modules,
  info,
}: GuideProps<typeof ElementalCombatLogParser>) => {
  const explanation = (
    <>
      <p>
        <b>
          <SpellLink spell={SPELLS.FLAME_SHOCK} />
        </b>{' '}
        is one of the best sources of damage for it's cast time. Additionally, it makes every{' '}
        <SpellLink spell={TALENTS_SHAMAN.LAVA_BURST_TALENT} /> into a critical hit. This should{' '}
        always be up on your target at low target counts so every{' '}
        <SpellLink spell={TALENTS_SHAMAN.LAVA_BURST_TALENT} /> critically hits.
      </p>
      <p>
        Every <SpellLink spell={SPELLS.FLAME_SHOCK} /> damage tick has a chance to proc{' '}
        <SpellLink spell={SPELLS.LAVA_SURGE} />, which reset the cooldown on{' '}
        <SpellLink spell={TALENTS_SHAMAN.LAVA_BURST_TALENT} /> and make your next cast instant.
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
          {formatPercentage((modules.flameShock as FlameShock).uptime)}% <small>uptime</small>
          <div
            style={{
              height: '40px' /* UptimeStackBar floats and doesn't have an intrinsic height */,
            }}
          >
            {
              // TODO: move this to a BuffStackGraph.  That's a bit more
              // complicated as that is built to work with a BuffStackTracker.
              // However, this is a debuff count!
            }
            <UptimeStackBar
              start={info.fightStart}
              end={info.fightEnd}
              barColor="#ac1f39"
              timeTooltip
              {...modules.flameShock.getDebuffStackHistory()}
            />
          </div>
        </div>
        {modules.flameShock.badLavaBursts > 0 && (
          <div className="flex-main">
            {modules.flameShock.badLavaBursts}{' '}
            <SpellLink spell={TALENTS_SHAMAN.LAVA_BURST_TALENT} /> without{' '}
            <SpellLink spell={SPELLS.FLAME_SHOCK} />
          </div>
        )}
      </RoundedPanel>
    </div>
  );

  return (
    <ExplanationAndDataSubSection
      title="Flame Shock"
      explanationPercent={GUIDE_EXPLANATION_PERCENT_WIDTH}
      explanation={explanation}
      data={data}
    />
  );
};
