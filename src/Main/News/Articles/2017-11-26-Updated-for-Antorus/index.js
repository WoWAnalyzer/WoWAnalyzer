import React from 'react';

import AntorusImage from 'Raids/AntorusTheBurningThrone/Images/antorus.jpg';
import ImageArticle from 'Main/News/ImageArticle';

const title = 'Updated for Antorus';

export default {
  date: new Date('2017-12-24'),
  title,
  full: (
    <ImageArticle title={title} image={AntorusImage} style={{ paddingTop: 350 }}>
      We've been working hard to implement all the new trinkets and tier bonuses available in the new raid <i>Antorus, the Burning Throne</i>. Let us know on <a href="https://discord.gg/AxphPxU">Discord</a> or <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> if you're still missing anything.
    </ImageArticle>
  ),
};
