import React from 'react';

import { Zeboot } from 'CONTRIBUTORS';
import RegularArticle from 'interface/news/RegularArticle';

import FilterExample from './filter.jpg';
import ExampleResults from './exampleresults.jpg';

export default (
  <RegularArticle title="Time Filtering" publishedAt="2019-07-23" publishedBy={Zeboot}>
    If you haven't noticed already, WoWAnalyzer has a new feature : <b>Time Filtering!</b> <br />
    A much requested feature for quite some time now, WoWAnalyzer now lets you filter the report to a range of time of your choosing, giving you the possibility to evaluate for example how well you performed during cooldowns, how much damage you did / took during a certain phase, and more! <br /><br />
    When you apply a time filter, we automatically attempt to try and preserve fight information from outside the time range where necessary - for example cooldown availability so we don't fault you for not using an ability that didn't come off CD during the time period - while preventing non-relevant events from contaminating the filtered data. <br />
    <div style={{ textAlign: 'center', marginBottom: '1em' }}>
      <img src={FilterExample} alt="Filter Example" style={{ width: '100%' }} />
      <div className="text-muted">The new filter interface element, letting you select timestamps and phases to filter the fight by.</div>
    </div>
    In addition to the time filter itself, we've also provided a phase selection. If a fight has phase information defined in our source code, we'll automatically try to find the phase transitions and provide you with a dropdown menu letting you select any of these phases by their respective timestamps. In the case of a wipe, we'll of course only show you phases you actually reached. <br />
    <br />
    Please do keep in mind, however, that filtering events like this can obviously lead to unexpected behaviour as a lot of modules - especially older ones or ones accessing fight timestamps directly - will have to be manually adjusted to work properly with filtered results, so take these with a grain of salt (although the majority of them work as expected) and please report any unexpected behaviour to us via <a href="https://wowanalyzer.com/discord">Discord</a> or on <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a>! <br />
    <div style={{ textAlign: 'center', marginBottom: '1em' }}>
      <img src={ExampleResults} alt="Example Results Page" style={{ width: '100%' }} />
      <div className="text-muted">An example of the statistics page adjusted by one specific phase.</div>
    </div>
    <h1>What this means for developers</h1>
    This change also has an impact on contributors in that the fight object has changed. In order to ensure future modules work as expected when the results are filtered, please take the time to read these small list of internal API changes: <br />
    The new fight object now looks like this:
    <pre><code>{`
      fight: {
        start_time: 9198573, //required, timestamp of the start of the selected time period
        end_time: 9214374, //required, timestamp of the end of the selected time period
        offset_time: 161450, //required, amount of ms between start of fight and start of time period
        original_end_time: 9214374, //timestamp of the end of the fight
        boss: 2273, //required, boss ID
        filtered: true, //required, true if the fight is in any way filtered to a time period
        phase: "I1", //optional, phase key if a phase is selected
        instance: 0, //optional, instance of a phase if phase is selected and can occur multiple times (aka Lady Ashvane)
      };
      `}
    </code></pre>
    When displaying timestamps, for example, make sure to adjust them by the <code>offset_time</code> in order to maintain timestamp accuracy. Additionally you can use the <code>filtered</code> attribute to check whether the user is viewing the entire fight or not and adjust your analysis accordingly. For other, more precise questions feel free to reach out to us on <a href="https://wowanalyzer.com/discord">Discord</a>!
    <br />
    <br />
    We hope you enjoy this new feature!
  </RegularArticle>
);
