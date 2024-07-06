import styled from '@emotion/styled';
import { OkMark } from '../index';
import { TooltipElement } from 'interface/Tooltip';
import { Trans, defineMessage } from '@lingui/macro';
import { i18n } from '@lingui/core';

const BadgeContainer = styled.span`
  white-space: nowrap;
  background: #2b2b2b;
  border-radius: 0.3em;
  padding: 0 0.4em;
  line-height: 1.8em;
  display: inline-flex;
  align-items: baseline;
  flex-direction: row;
  gap: 0.25em;

  & i {
    top: 2px;
  }
`;

export default function FoundationSupportBadge({
  withTooltip,
}: {
  withTooltip?: boolean;
}): JSX.Element {
  const badge = (
    <BadgeContainer>
      <OkMark />{' '}
      <Trans id="interface.guide.foundation.foundational-support">Foundational Support</Trans>
    </BadgeContainer>
  );

  if (withTooltip) {
    return <TooltipElement content={i18n._(FOUNDATIONAL_SUPPORT_DESC)}>{badge}</TooltipElement>;
  } else {
    return badge;
  }
}

const FOUNDATIONAL_SUPPORT_DESC = defineMessage({
  id: 'interface.guide.foundation.foundational-support-desc',
  message:
    'Foundational support covers analysis of uptime, cancelled casts, cooldowns, and other core aspects of gameplay common across all specs.',
});
