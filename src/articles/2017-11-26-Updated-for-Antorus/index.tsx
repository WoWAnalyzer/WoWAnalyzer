import React from 'react';

import NewsImageArticle from 'interface/NewsImageArticle';

import AntorusImage from './antorus.jpg';

export default (
  <NewsImageArticle title="Updated for Antorus" image={AntorusImage} style={{ paddingTop: 350 }}>
    We've been working hard to implement all the new trinkets and tier bonuses available in the new raid <i>Antorus, the Burning Throne</i>. Let us know on <a href="https://discord.gg/AxphPxU">Discord</a> or <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> if you're still missing anything.
  </NewsImageArticle>
);
