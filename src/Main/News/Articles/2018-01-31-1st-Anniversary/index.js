import React from 'react';

import RegularArticle from 'Main/News/RegularArticle';
import Preview from 'Main/News/Preview';

const title = 'WoWAnalyzer\'s first anniversary';

export default {
  date: new Date('2017-12-24'),
  title,
  short: (
    <Preview title={title} image="">
      It has already been a year! Time flies when you're working hard. We want to use this milestone to recap everything that has happened during this past year.
    </Preview>
  ),
  full: (
    <RegularArticle title={title}>
      NYI
    </RegularArticle>
  ),
};
