import styled from '@emotion/styled';
import { ReactNode } from 'react';
import { CooldownBar } from 'parser/ui/CooldownBar';
import { SpellIcon, SpellLink, TooltipElement } from 'interface';
import { BadColor, GoodColor, MediocreColor, OkColor, useAnalyzer } from 'interface/guide';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import { formatPercentage } from 'common/format';

/**
 * Displays a spell's cast efficiency on the left,
 * and then that spell's {@link CooldownBar} on the right.
 * @param spellId the spell ID to show cast effic and cooldowns for
 * @param gapHighlightMode see {@link CooldownBar} props
 * @param minimizeIcons see {@link CooldownBar} props
 * @param useThresholds iff true, the cast efficiency percentage will be color coded by performance
 *    using the abilities efficiency requirements.
 * @param slimLines iff true, then cast lines will be skinnier. Very useful for high CPM abilities!
 */
export default function CastEfficiencyBar({
  spellId,
  gapHighlightMode,
  minimizeIcons,
  useThresholds,
  slimLines,
  activeWindows,
}: React.ComponentProps<typeof CooldownBar> & {
  useThresholds?: boolean;
}): JSX.Element {
  const castEffic = useAnalyzer(CastEfficiency)?.getCastEfficiencyForSpellId(spellId);
  let tooltip: ReactNode = `Couldn't get cast efficiency info!`;
  let utilDisplay = `N/A`;
  let textColor: string | undefined;
  if (castEffic && castEffic.efficiency !== null) {
    const gotMaxCasts = castEffic.casts === castEffic.maxCasts;
    const effectiveUtil = gotMaxCasts ? 1 : castEffic.efficiency;

    if (useThresholds) {
      if (effectiveUtil < castEffic.majorIssueEfficiency) {
        textColor = BadColor;
      } else if (effectiveUtil < castEffic.averageIssueEfficiency) {
        textColor = MediocreColor;
      } else if (effectiveUtil < castEffic.recommendedEfficiency) {
        textColor = OkColor;
      } else {
        textColor = GoodColor;
      }
    }

    const windowName =
      activeWindows === undefined ? 'the encounter' : 'the time that it was usable';

    utilDisplay = formatPercentage(effectiveUtil, 0) + '%';
    tooltip = (
      <>
        You cast <SpellLink id={spellId} /> <strong>{castEffic.casts}</strong> out of{' '}
        <strong>{castEffic.maxCasts}</strong> possible times.
        <br />
        It was on cooldown for <strong>{formatPercentage(castEffic.efficiency, 0)}%</strong> of{' '}
        {windowName}.
        <br />
        {gotMaxCasts && '(100% cast efficiency because you used the maximum possible casts)'}
      </>
    );
  }

  return (
    <CooldownUtilBarContainer>
      <div style={{ color: textColor }}>
        <SpellIcon id={spellId} style={{ height: '28px' }} />{' '}
        <TooltipElement content={tooltip}>
          {utilDisplay} <small>effic</small>
        </TooltipElement>
      </div>
      <CooldownBar
        activeWindows={activeWindows}
        spellId={spellId}
        gapHighlightMode={gapHighlightMode}
        minimizeIcons={minimizeIcons}
        slimLines={slimLines}
      />
    </CooldownUtilBarContainer>
  );
}

const CooldownUtilBarContainer = styled.div`
  font-size: 20px;
  padding: 2px;
  display: grid;
  grid-column-gap: 1em;
  grid-template-columns: 120px 1fr;
  align-items: center;
`;
