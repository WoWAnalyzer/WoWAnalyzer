import React from 'react';
import { Link } from 'react-router-dom';

import { Zerotorescue } from 'CONTRIBUTORS';

import RegularArticle from '../../RegularArticle';
import FightDowntimeToggle from './FightDowntimeToggle.png';
import ArgusBalance from './ArgusBalance.png';
import ImonarTransition from './imonar-transition.gif';

export default (
  <RegularArticle title="Fight downtime" publishedAt="2018-07-06" publishedBy={Zerotorescue}>
    Fight downtime is a new feature we're working on to improve the accuracy for fights with unavoidable downtime.<br /><br />

    Fights such as Antorus's Argus and Imonar have a high amount of unavoidable downtime caused by mechanics. Argus kills the entire raid during which nobody can do anything, and Imonar moves between platforms, making it impossible for DPS to deal any damage (but healers still have to heal).<br /><br />

    <figure>
      <img src={ImonarTransition} alt="The imonar transitions" style={{ maxWidth: 500 }} />
      <figcaption>
        Downtime caused by Imonar transitioning between platforms.
      </figcaption>
    </figure><br />

    The downtime introduced by these mechanics skews our statistics and suggestions. It makes it impossible or inefficient to hit the recommended activity, cast targets, buff uptimes, and so on. This is why we had to recommend players to look at more straightforward fights such as Varimathras. Those few fights have also been a reason for some users to discredit us entirely.<br /><br />

    To resolve these issues we're working on a new feature that tracks the fight downtime, excludes it from the statistics, and adjusts the suggestion thresholds. This will improve the accuracy of the data we present and make it more consistent across fights.<br /><br />

    <figure>
      <img src={ArgusBalance} alt="Argus difference for a Balance Druid" />
      <figcaption>
        The checklist for <Link to="/report/tMxkGpbc4dhXm8K2/13-Mythic+Argus+the+Unmaker+-+Kill+(9:58)/2-Chrisums">a Balance druid on a Mythic Argus kill</Link>, before and after adjusting for fight downtime.
      </figcaption>
    </figure><br />

    To account for fight downtime we will implement a tracker for each boss specifically. This tracker will analyze events in your raid to determine with precision the exact amount of downtime experienced. The fight downtime will be role-specific, so that healers won't be affected by dps downtime caused by the boss moving away. We're not yet sure how we'll implement tank downtime, we're considering marking any period not actively tanking a boss as fight downtime.<br /><br />

    Time dead will also be marked as fight downtime so that you can still analyze fights where you died with decent accuracy. We figured since we're already yelling at you in the suggestions for dying, we'd get a sore throat if we also yelled at you for all the issues caused by dying. There's also no need to make everything else less useful when your biggest mistake has already been pointed out.<br /><br />

    With the Battle for Azeroth prepatch around the corner, we're focussed on support for that. So for now only Argus and Imonar will be supported. The plan is to provide full support for Uldir once that's released.<br /><br />

    You can enable the fight downtime adjustments for supported fights at the top of the statistics section of the results page. For now you should consider this an experimental feature that may not be completely bug-free. Please let us know if you see anything weird. Once we're done refining the feature we'll enable the setting by default.<br /><br />

    <figure style={{ textAlign: 'center' }}>
      <img src={FightDowntimeToggle} alt="Fight downtime toggle" />
      <figcaption>
        The fight downtime toggle on the results page.
      </figcaption>
    </figure>
  </RegularArticle>
);
