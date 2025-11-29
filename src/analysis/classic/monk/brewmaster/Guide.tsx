import { GuideProps, Section, useAnalyzer } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { FoundationCooldownSection } from 'interface/guide/foundation/FoundationCooldownSection';
import { FoundationDowntimeSection } from 'interface/guide/foundation/FoundationDowntimeSection';
import { useExpansionContext } from 'interface/report/ExpansionContext';
import { AplSectionData } from 'interface/guide/components/Apl';
import {
  apl,
  check,
  isUsingParseRotation,
  parselordApl,
  parselordCheck,
} from './modules/features/AplCheck';
import Para from 'interface/guide/Para';
import ResourceLink from 'interface/ResourceLink';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellLink from 'interface/SpellLink';
import spells from './spell-list_Monk_Brewmaster.classic';
import { ReactNode, useMemo, useState, type JSX } from 'react';
import SPELLS from 'common/SPELLS/classic';
import { WarningIcon } from 'interface/icons';
import type CombatLogParser from './CombatLogParser';
import AlertInfo from 'interface/AlertInfo';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Vengeance from 'parser/classic/modules/Vengeance';

export default function Guide({ events, info }: GuideProps<typeof CombatLogParser>): JSX.Element {
  const { expansion } = useExpansionContext();
  const castEff = useAnalyzer(CastEfficiency);
  const veng = useAnalyzer(Vengeance);

  const parseRotationActive = useMemo(() => {
    if (!castEff) {
      return false;
    }
    return isUsingParseRotation(events, info, castEff);
  }, [events, info, castEff]);

  const aplTabs = useMemo(
    () => [
      {
        label: 'Standard Rotation',
        component: (
          <>
            {parseRotationActive && (
              <AlertInfo>
                This player appears to be using the <strong>Parsing Rotation</strong>.
              </AlertInfo>
            )}
            <Para>
              The standard rotation focuses on generating{' '}
              <ResourceLink id={RESOURCE_TYPES.CHI.id} /> to power your defensive abilities like{' '}
              <SpellLink spell={spells.PURIFYING_BREW} />. As a side-effect, it also generates lots
              of <SpellLink spell={spells.ELUSIVE_BREW} /> stacks and passively maintains{' '}
              <SpellLink spell={SPELLS.SHUFFLE} />. This is not necessarily the highest damage, but
              it is sturdy and reliable.
            </Para>
            <AplSectionData checker={check} apl={apl} />
          </>
        ),
      },
      {
        label: <>{parseRotationActive && <WarningIcon />} Parsing Rotation</>,
        component: (
          <>
            <Para>
              The "parsing" rotation focuses on damage at the expense of defensive power.{' '}
              <ResourceLink id={RESOURCE_TYPES.CHI.id} /> generation is greatly reduced by
              prioritizing <SpellLink spell={spells.TIGER_PALM} /> and{' '}
              <SpellLink spell={spells.RUSHING_JADE_WIND_TALENT} />, which may leave your defensive
              abilities unavailable. It <em>does</em> do more damage, though.
            </Para>
            <AplSectionData checker={parselordCheck} apl={parselordApl} />
          </>
        ),
      },
    ],
    [parseRotationActive],
  );
  return (
    <>
      <Section title="Core Skills">
        <FoundationDowntimeSection />
        <FoundationCooldownSection />
      </Section>
      <Section title="Rotation">
        <Para>
          The Brewmaster rotation in Mists of Pandaria revolves around generating{' '}
          <ResourceLink id={RESOURCE_TYPES.CHI.id} /> efficiently with{' '}
          <SpellLink spell={spells.KEG_SMASH} /> and <SpellLink spell={spells.EXPEL_HARM} />, then
          spending it on <SpellLink spell={spells.BLACKOUT_KICK} />. Defensive abilities like{' '}
          <SpellLink spell={spells.ELUSIVE_BREW} /> are not included in this analysis, but you
          should still use them!
        </Para>
        <AlertInfo>
          In Mists of Pandaria, tank damage is heavily dependent on{' '}
          <SpellLink spell={spells.VENGEANCE_PASSIVE} />! It is so powerful that it is possible to
          execute your rotation perfectly and still do worse damage than someone with better{' '}
          <SpellLink spell={spells.VENGEANCE_PASSIVE} />. The best players will have good{' '}
          <SpellLink spell={spells.VENGEANCE_PASSIVE} /> and a good rotation.
        </AlertInfo>
        <TabWrapper tabs={aplTabs} />
        {veng?.guideSubsection}
      </Section>
      <PreparationSection expansion={expansion} />
    </>
  );
}

interface TabWrapperProps {
  tabs: {
    label: ReactNode;
    component: ReactNode;
  }[];
}

function TabWrapper({ tabs }: TabWrapperProps): JSX.Element | null {
  const [selectedTab, setSelectedTab] = useState(0);
  if (tabs.length === 0) {
    return null;
  }

  const tab = tabs[selectedTab];
  return (
    <div style={{ paddingTop: '1em' }}>
      <div
        className="flex"
        style={{ flexDirection: 'column', alignItems: 'end', borderBottom: '1px solid #ccc2' }}
      >
        <div className="btn-group">
          {tabs.map(({ label }, index) => (
            <button
              type="button"
              className={index === selectedTab ? 'btn btn-background active' : 'btn btn-background'}
              key={index}
              onClick={() => setSelectedTab(index)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ paddingTop: '1em' }}>{tab.component}</div>
    </div>
  );
}
