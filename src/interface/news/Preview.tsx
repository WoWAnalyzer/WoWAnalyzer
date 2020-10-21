import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import makeUrl from './makeUrl';

interface Props {
  title: React.ReactNode;
  image: string;
  children: ReactNode;
}

const Preview = ({ title, children, image }: Props) => (
  <article>
    <div className="panel flex">
      <div
        className="flex-sub"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          width: '25%',
        }}
      />
      <div className="flex-main">
        <div className="panel-heading">
          <h2>{title}</h2>
        </div>
        <div className="panel-body" style={{ padding: '15px 22px' }}>
          {children} <Link to={makeUrl(title)}>Read more</Link>
        </div>
      </div>
    </div>
  </article>
);

export default Preview;
