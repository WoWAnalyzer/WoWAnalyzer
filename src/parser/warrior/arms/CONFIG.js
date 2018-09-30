import React from 'react';

// import { Aelexe } from 'CONTRIBUTORS';
import SPECS from 'game/SPECS';
import Warning from 'interface/common/Alert/Warning';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [],
  // The WoW client patch this spec was last updated to be fully compatible with.
  patchCompatibility: '7.3.5',
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <React.Fragment>
      Hey I've been hard at work making this analyzer for you. I hope the suggestions give you useful pointers to improve your performance. Remember: focus on improving only one or two important things at a time. Improving isn't easy and will need your full focus until it becomes second nature to you.<br /><br />

      <Warning>
        Hey there! A good basis has been implemented for this spec, but it needs to be fleshed out more to provide all the feedback possible.<br /><br />

        This spec needs a focused maintainer. If you want to give it a try, check <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> for more information.
      </Warning><br />

      <Warning>
        Hi <kbd>@Zerotorescue</kbd> here. I updated this spec to be compatible with BFA, but I'm no Arms expert. If there's anything wrong please @poke me on Discord and I'll fix it if I can.
      </Warning>
    </React.Fragment>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/28aWCHp1zX6qVcMd/63-Heroic+Vectis+-+Kill+(5:28)/4-Mcsam',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.ARMS_WARRIOR,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () => import('./CombatLogParser' /* webpackChunkName: "Warrior" */).then(exports => exports.default),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
