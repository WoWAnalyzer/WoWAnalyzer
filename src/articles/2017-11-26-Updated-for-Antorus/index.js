import React from 'react';

import { Zerotorescue } from 'CONTRIBUTORS';
import ImageArticle from 'interface/news/ImageArticle';

import AntorusImage from './antorus.jpg';

export default (
  <ImageArticle title="Updated for Antorus" publishedAt="2017-12-24" publishedBy={Zerotorescue} image={AntorusImage} style={{ paddingTop: 350 }}>
    We've been working hard to implement all the new trinkets and tier bonuses available in the new raid <i>Antorus, the Burning Throne</i>. Let us know on <a href="https://discord.gg/AxphPxU">Discord</a> or <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> if you're still missing anything.
  </ImageArticle>
);
