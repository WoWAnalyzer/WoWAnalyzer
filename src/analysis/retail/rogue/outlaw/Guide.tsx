import { GuideProps } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
// import { t, Trans } from '@lingui/macro';
// import EnergyCapWaste from 'analysis/retail/rogue/shared/guide/EnergyCapWaste';
// import TALENTS from 'common/TALENTS/rogue';
// import HideExplanationsToggle from 'interface/guide/components/HideExplanationsToggle';
// import { ResourceLink, SpellLink } from 'interface';
// import SPELLS from 'common/SPELLS';
// import { RoundedPanel, SideBySidePanels } from 'interface/guide/components/GuideDivs';
// import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';
// import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import CombatLogParser from './CombatLogParser';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <PreparationSection />
    </>
  );
}
