import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from '../../CombatLogParser';
import { AplSectionData } from 'interface/guide/components/Apl';
import * as AplCheck from '../apl/AplCheck';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/shaman';

export default function Rotation({ modules, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Single Target Rotation">
      <p>
        This single target rotation analyzer is based on a number of sources, including the guides
        at{' '}
        <a
          href="https://www.wowhead.com/guide/classes/shaman/enhancement/rotation-cooldowns-pve-dps#single-target"
          target="_blank"
          rel="noopener noreferrer"
        >
          Wowhead
        </a>
        {' and '}
        <a
          href="https://www.icy-veins.com/wow/enhancement-shaman-pve-dps-rotation-cooldowns-abilities#enhancement-shaman-single-target-rotation"
          target="_blank"
          rel="noopener noreferrer"
        >
          Icy-Veins
        </a>{' '}
        (credit to Wordup for writing these guides).
      </p>
      <AplSectionData checker={AplCheck.check} apl={AplCheck.apl(info)} />
      <hr />
      <p>
        This list does not include cooldowns (e.g. <SpellLink spell={TALENTS.FERAL_SPIRIT_TALENT} />
        , <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} />,{' '}
        <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_TALENT} />,{' '}
        <SpellLink spell={TALENTS.SUNDERING_TALENT} />, etc). Cooldowns may often be held for fight
        mechanics, and appear as common problems which interfere with rotation analysis.
      </p>
      <div>
        This should be used as a reference point for improvement when comparing against other logs.
        It does not cover the full set of priorites used by Raidbots (much like the written guides)
        as the list would be far too long and too complex to follow.
        <br />
        <br />
        Potential areas of inaccuracy:
        <ul>
          <li>Holding cooldowns for raid events</li>
          <li>Multiple targets</li>
          <li>Movement or periods of downtime</li>
        </ul>
      </div>
    </Section>
  );
}
