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
        <SpellLink spell={TALENTS_SHAMAN.LAVA_BURST_TALENT} /> into a critical hit. This should
        always be up on your target at low target counts.
      </p>
      {info.combatant.hasTalent(TALENTS_SHAMAN.LAVA_SURGE_TALENT) && (
        <p>
          Every <SpellLink spell={SPELLS.FLAME_SHOCK} /> damage tick has a chance to proc{' '}
          <SpellLink spell={TALENTS_SHAMAN.LAVA_SURGE_TALENT} />, which reset the cooldown on{' '}
          <SpellLink spell={TALENTS_SHAMAN.LAVA_BURST_TALENT} /> and make your next cast instant.
        </p>
      )}
    </>
  );

  const data = (
    <div>
      <RoundedPanel>
        <strong>
          <SpellLink spell={SPELLS.FLAME_SHOCK} /> uptime
        </strong>
        <div className="flex-main chart" style={{ height: '40px' }}>
          {formatPercentage((modules.flameShock as FlameShock).uptime)}% <small>uptime</small>
          <UptimeStackBar
            start={info.fightStart}
            end={info.fightEnd}
            barColor="#ac1f39"
            timeTooltip
            {...modules.flameShock.getDebuffStackHistory()}
          />
        </div>
        <div className="flex-main chart" style={{ padding: 15 }}>
          {modules.flameShock.badLavaBursts} <SpellLink spell={TALENTS_SHAMAN.LAVA_BURST_TALENT} />{' '}
          without <SpellLink spell={SPELLS.FLAME_SHOCK} />
        </div>
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
