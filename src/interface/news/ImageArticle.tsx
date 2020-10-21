import React, { ReactNode } from 'react';

interface Props {
  title: React.ReactNode;
  image: React.ReactNode;
  style: object;
  children: ReactNode;
}

const ImageArticle = ({ title, children, image, style }: Props) => (
  <article>
    <div className="panel image-background" style={{ backgroundImage: `url(${image})`, ...style }}>
      <div className="panel-body">
        <div className="row">
          <div className="col-md-10">
            <h1>{title}</h1>
            <div className="description">{children}</div>
          </div>
        </div>
      </div>
    </div>
  </article>
);

export default ImageArticle;
