import { SpellLink } from 'interface';
import CombatLogParser from './CombatLogParser';
import { GuideProps, Section } from 'interface/guide';
import devestationTalents from 'common/TALENTS/evoker';
import { AplSectionData } from 'interface/guide/components/Apl';
import * as AplCheck from './modules/AplCheck';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { CooldownSection } from './modules/guide/Cooldown';
import AlertInfo from 'interface/AlertInfo';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core Rotation (no Dragon Rage)">
        <AlertInfo>
          This details your rotation outside of{' '}
          <SpellLink id={devestationTalents.DRAGONRAGE_TALENT} />. Please use the accuracy and
          problems pointed out here are <b>guidelines</b> and don't factor in raid conditions. To
          get a true measure of success you should compare your accuracy to other top Evokers in the
          same fight with Warcraft Logs (e.g{' '}
          <a href="https://www.warcraftlogs.com/zone/rankings/31#boss=2639&difficulty=4&class=Evoker&spec=Devastation">
            Heroic Terros Top 100
          </a>
          )
        </AlertInfo>
        <p>
          The Devastation rotation is driven by a priority list. The priority list is primarily
          around using your empowered spells: Fire Breath and Eternity Surge on CD and spending your
          essence on Disintegrate or Pyre.
        </p>
        <p>
          Note: This prioritiy list follows suggestions from{' '}
          <a href="https://www.wowhead.com/guide/classes/evoker/devastation/overview-pve-dps">
            Wowhead
          </a>
          , <a href="https://www.icy-veins.com/wow/devastation-monk-pve-dps-guide">Icy Veins</a>,
          and <a href="https://discord.com/invite/evoker">Evoker Discord</a>.
        </p>
        <AplSectionData checker={AplCheck.check} apl={AplCheck.apl()} />
      </Section>
      <CooldownSection modules={modules} info={info} events={events} />
      <Section title="Essence Graph">
        <p>
          This documents your graph of essence over time. You shouldn't have long windows of
          overcapped essence unless you are in Dragon Rage.
          {modules.essenceGraph.plot}
        </p>
      </Section>
      <PreparationSection />
    </>
  );
}
