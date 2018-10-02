import React from 'react';
import { Link } from 'react-router-dom';

import { Zerotorescue } from 'CONTRIBUTORS';
import RegularArticle from 'interface/news/RegularArticle';

import RandomImageToMakeThisArticleLessBland from './weirdnelfandherfriend.png';

export default (
  <RegularArticle title={<React.Fragment>What are <i>YOUR</i> suggestions?</React.Fragment>} publishedAt="2018-09-30" publishedBy={Zerotorescue}>
    <img
      src={RandomImageToMakeThisArticleLessBland}
      alt=""
      style={{
        float: 'right',
        maxWidth: '50%',
        marginRight: -22,
        marginBottom: -15,
      }}
    />

    We'd love to hear your suggestions. What can we do better? Do you have a grand idea? Is there a spec we should prioritize? Let us know on the new <a href="https://suggestions.wowanalyzer.com/">suggestions board</a>! There you can share your suggestions or give a vote to other people's amazing suggestions. And we'll even put a bounty on the best suggestions using the funds raised with <Link to="/premium">Premium</Link>!
  </RegularArticle>
);
