import React from 'react';

import { Zerotorescue } from 'CONTRIBUTORS';
import RegularArticle from 'Main/News/RegularArticle';

import ChecklistOverview from './checklist-overview.png';
import ChecklistItem from './checklist-item.png';
import Results2point0 from './results-2.0.png';

export default (
  <RegularArticle title="Version 2.0 is here! Check your fights with the all new checklist" publishedAt="2017-12-24" publishedBy={Zerotorescue}>
    Hey all! We're very excited to finally be able to share with you version 2.0 of WoWAnalyzer! This has the biggest change since the introduction of suggestions: the checklist. The checklist is a much more intuitive way to convey your performance in a fight. Instead of individual (often considered <i>harsh</i>) suggestions, the checklist shows an overview of <i>rules</i> which are marked with a green tick if you sufficiently passed the recommended thresholds for the requirements, and a red cross if your performance was below recommended parameters.<br /><br />

    <div style={{ textAlign: 'center', marginBottom: '1em' }}>
      <a href="/report/LRchdHVAmWtNQ8Fj/22-Mythic+Harjatan+-+Kill+(5:54)/Zerotorescue">
        <img src={ChecklistOverview} alt="Checklist overview" style={{ width: '100%', maxWidth: 600 }} />
      </a>
      <div className="text-muted">A subset of the checklist rules for Holy Paladins.</div>
    </div>

    Presenting your gameplay suggestions in such a way should give you a much better overview of what goes into playing your spec well. Checks that you pass will continue to be visible as a way to provide you with positive feedback about things you're doing well (and so you can review them for minor improvements). The rule performance is also less nitpicky than individual suggestions so that we can put more focus on large improvements.<br /><br />

    <div style={{ textAlign: 'center', marginBottom: '1em' }}>
      <a href="/report/LRchdHVAmWtNQ8Fj/22-Mythic+Harjatan+-+Kill+(5:54)/Zerotorescue">
        <img src={ChecklistItem} alt="Checklist rule" style={{ width: '100%', maxWidth: 600 }} />
      </a>
      <div className="text-muted">A single checklist rule with its description and checks.</div>
    </div>

    With the introduction of the checklist we have also reworked the results page to present the most important information from top to bottom.<br /><br />

    <div style={{ textAlign: 'center', marginBottom: '1em' }}>
      <a href="/report/LRchdHVAmWtNQ8Fj/22-Mythic+Harjatan+-+Kill+(5:54)/Zerotorescue">
        <img src={Results2point0} alt="Results layout 2.0" style={{ width: '100%', maxWidth: 200 }} />
      </a>
      <div className="text-muted">The new results page is organized by how commonly info is used.</div>
    </div>

    The checklist is available right now for <a href="/report/hNqbFwd7Mx3G1KnZ/18-Mythic+Antoran+High+Command+-+Kill+(6:51)/Taffly">Holy Paladin</a>, <a href="/report/wmfhYRxTpvZyHLdF/1-Mythic+Garothi+Worldbreaker+-+Kill+(4:48)/Hassebewlen">Shadow Priest</a>, <a href="/report/mtjvg4FQ6A8RGz1V/3-Mythic+Garothi+Worldbreaker+-+Kill+(6:18)/Paranema">Restoration Shaman</a>, <a href="/report/wXPNHQqrjmVbafJL/38-Mythic+Garothi+Worldbreaker+-+Kill+(5:05)/Maareczek">Marksmanship Hunter</a>, <a href="/report/2MNkGb36FW1gX8zx/15-Mythic+Imonar+the+Soulhunter+-+Kill+(7:45)/Anom">Mistweaver Monk</a>, <a href="/report/t3wKdDkB7fZqbmWz/1-Normal+Garothi+Worldbreaker+-+Kill+(4:24)/Sref">Frost Mage</a>, <a href="/report/72t9vbcAqdpVRfBQ/12-Mythic+Garothi+Worldbreaker+-+Kill+(6:15)/Maxweii">Unholy Death Knight</a> and <a href="/report/hxzFPBaWLJrG1NQR/24-Heroic+Imonar+the+Soulhunter+-+Kill+(3:38)/Putro">Beast Mastery Hunter</a>. More specs to follow later (at the maintainers discretion).
  </RegularArticle>
);
