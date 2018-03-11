import React from 'react';

import { faide } from 'MAINTAINERS';
import SPECS from 'common/SPECS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list.
  maintainers: [faide],
  // The WoW client patch this spec was last updated to be fully compatible with.
  patchCompatibility: '7.3',
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <Wrapper>
      Hi! I'm faide, and I maintain the guardian druid analyzer.  Thanks for being here!<br /><br />

      The suggestions and statistics here are provided to give you an idea of how to improve your play, both defensively and offensively.  A great player can manage both aspects of the role, and both are important to being an effective tank.<br /><br />

      The guardian toolkit is big and diverse, and knowing every corner of it is the key to success.  The most important thing is to keep your hard-hitting, rage generating spells on cooldown at all times (<SpellLink id={SPELLS.THRASH_BEAR.id} />, <SpellLink id={SPELLS.MANGLE_BEAR.id} />, <SpellLink id={SPELLS.MOONFIRE.id} /> with <SpellLink id={SPELLS.GALACTIC_GUARDIAN_TALENT.id} />). Keep <SpellLink id={SPELLS.IRONFUR.id} /> up when you're tanking the boss, use <SpellLink id={SPELLS.FRENZIED_REGENERATION.id} /> when you're low or taking heavy damage, use <SpellLink id={SPELLS.BARKSKIN.id} /> and <SpellLink id={SPELLS.RAGE_OF_THE_SLEEPER.id} /> frequently to mitigate and deal loads of damage, and save <SpellLink id={SPELLS.SURVIVAL_INSTINCTS.id} /> for big hits.<br /><br />

      If you have any suggestions or feedback on the analyzer, check out the Github issue below. If you'd like to know more about Guardian Druid, head over to the <a href="https://discord.gg/dreamgrove" target="_blank" rel="noopener noreferrer">Dreamgrove</a> discord server.  We have tons of resources and guides to get you started.
    </Wrapper>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  // exampleReport: '/report/72t9vbcAqdpVRfBQ/12-Mythic+Garothi+Worldbreaker+-+Kill+(6:15)/Maxweii',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.GUARDIAN_DRUID,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: CombatLogParser,
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
