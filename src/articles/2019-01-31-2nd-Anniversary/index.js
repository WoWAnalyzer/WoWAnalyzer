import React from 'react';
import { Link } from 'react-router-dom';

import { Zerotorescue } from 'CONTRIBUTORS';
import RegularArticle from 'interface/news/RegularArticle';
import makeNewsUrl from 'interface/news/makeUrl';

import Report from './report.jpg';
import Statistics from './statistics.jpg';
import Timeline from './timeline.png';
import PlayerSelection from './playerselection.jpg';
import Logo from './logo.png';

export default (
  <RegularArticle title="WoWAnalyzer's second anniversary" publishedAt="2019-01-31" publishedBy={Zerotorescue}>
    Yay! WoWAnalyzer just turned two years old! We're not going to do a <Link to={makeNewsUrl('WoWAnalyzer\'s first anniversary')}>year recap</Link> this year. That took way too much time to make last time. Instead we spent an exorbitant amount of time on a complete redesign of the site. There's still a lot left to do before it's finished, but here are some of the things that are close to final.<br /><br />

    We're changing our color scheme from red to yellow. Yellow is a much easier color. We couldn't leave the logo as-is when changing the primary color, so we designed a new one:<br /><br />

    <div style={{ textAlign: 'center', marginBottom: '1em' }}>
      <img src={Logo} alt="Logo" style={{ width: '100%', maxWidth: 232 }} />
      <div className="text-muted">This is the new logo, representing an A and up arrow for improvement.</div>
    </div>

    Almost nothing is being left unchanged as can be seen from this preview of the report page:<br /><br />

    <div style={{ textAlign: 'center', marginBottom: '1em' }}>
      <img src={Report} alt="Report" style={{ width: '100%', maxWidth: 600 }} />
      <div className="text-muted">The report layout has been entirely reworked.</div>
    </div>

    The statistics tab is also receiving a lot of attention. We want it to have more variation and make it easier to read.<br /><br />

    <div style={{ textAlign: 'center', marginBottom: '1em' }}>
      <img src={Statistics} alt="Statistics" style={{ width: '100%', maxWidth: 600 }} />
      <div className="text-muted">Spec maintainers will be provided the tools to easily use custom graphics for their statistics.</div>
    </div>

    We're also entirely reworking the timeline. It will shows buff uptimes and all casts will be shown on a single bar to much more easily see what you cast and where downtime was.<br /><br />

    <div style={{ textAlign: 'center', marginBottom: '1em' }}>
      <img src={Timeline} alt="Timeline" style={{ width: '100%', maxWidth: 800 }} />
      <div className="text-muted">The timeline shows buff windows, casts, channels, downtime, instant spells and spell cooldowns. That's a lot of data to present in such a small amount of space.</div>
    </div>

    And the final thing we can show you today is the new player selection.<br /><br />

    <div style={{ textAlign: 'center', marginBottom: '1em' }}>
      <img src={PlayerSelection} alt="Raid composition" style={{ width: '100%', maxWidth: 800 }} />
      <div className="text-muted">The player selection shows all players with their character avatar.</div>
    </div>

    These changes are coming as soon as they're ready. The release is currently planned for Q1 of 2019 and more changes will be coming later in the year. Please consider <Link to="premium">premium</Link> if you want to support development and keep the project moving forward a bit longer.
  </RegularArticle>
);
