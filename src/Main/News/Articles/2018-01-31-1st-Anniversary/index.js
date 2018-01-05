import React from 'react';

import RegularArticle from 'Main/News/RegularArticle';
import Preview from 'Main/News/Preview';

// noinspection RequiredAttributes

export default {
  date: new Date('2017-12-24'),
  title: 'WoWAnalyzer\'s first anniversary',
  short: (
    <Preview image="https://media.giphy.com/media/sIoUUXfh3W51K/giphy.gif">
      It has already been a year! Time flies when you're having fun working hard. We want to use this milestone to recap the progress we have made during this past year.
    </Preview>
  ),
  full: (
    <RegularArticle>
      NYI
    </RegularArticle>
  ),
};
