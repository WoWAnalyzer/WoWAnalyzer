import React from 'react';
import { Link } from 'react-router-dom';

import RegularArticle from 'Main/News/RegularArticle';
import MasteryRadiusImage from 'Main/Images/mastery-radius.png';

export const title = "About WoWAnalyzer the World of Warcraft analyzer";

export default (
  <RegularArticle title={title} published="2017-01-31">
    <img src={MasteryRadiusImage} alt="Mastery radius" className="pull-right" style={{ margin: 15 }} />
    WoWAnalyzer is a comprehensive tool for analyzing your performance based on important metrics for your spec. You will need a Warcraft Logs report with advanced combat logging enabled to start. Private logs can not be used, if your guild has private logs you will have to <a href="https://www.warcraftlogs.com/help/start/">upload your own logs</a> or change the existing logs to the <i>unlisted</i> privacy option instead.<br /><br />

    Here are some interesting examples: <Link to="/report/hNqbFwd7Mx3G1KnZ/18-Mythic+Antoran+High+Command+-+Kill+(6:51)/Taffly" className="Paladin">Holy Paladin</Link>, <Link to="/report/wmfhYRxTpvZyHLdF/1-Mythic+Garothi+Worldbreaker+-+Kill+(4:48)/Hassebewlen" className="Priest">Shadow Priest</Link>, <Link to="/report/mtjvg4FQ6A8RGz1V/3-Mythic+Garothi+Worldbreaker+-+Kill+(6:18)/Paranema" className="Shaman">Restoration Shaman</Link>, <Link to="/report/wXPNHQqrjmVbafJL/38-Mythic+Garothi+Worldbreaker+-+Kill+(5:05)/Maareczek" className="Hunter">Marksmanship Hunter</Link>, <Link to="/report/2MNkGb36FW1gX8zx/15-Mythic+Imonar+the+Soulhunter+-+Kill+(7:45)/Anom" className="Monk">Mistweaver Monk</Link>, <Link to="/report/t3wKdDkB7fZqbmWz/1-Normal+Garothi+Worldbreaker+-+Kill+(4:24)/Sref" className="Mage">Frost Mage</Link>, <Link to="/report/72t9vbcAqdpVRfBQ/12-Mythic+Garothi+Worldbreaker+-+Kill+(6:15)/Maxweii" className="DeathKnight">Unholy Death Knight</Link> and <Link to="/report/hxzFPBaWLJrG1NQR/24-Heroic+Imonar+the+Soulhunter+-+Kill+(3:38)/Putro" className="Hunter">Beast Mastery Hunter</Link>. Let us know if you want your logs to be featured here.
    <br /><br />

    Feature requests and bug reports are welcome! On <a href="https://discord.gg/AxphPxU">Discord</a> or create an issue <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues">here</a>.
  </RegularArticle>
);
