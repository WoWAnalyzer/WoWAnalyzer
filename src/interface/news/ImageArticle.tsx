/* eslint react/prop-types: 0 */
import React from 'react';

interface Props {
  title: React.ReactNode,
  image: React.ReactNode,
  style: object
}

const ImageArticle: React.FC<Props> = (props) => {
  const { title, children, image, style } = props;

  return (
    <article>
      <div className="panel image-background" style={{ backgroundImage: `url(${image})`, ...style }}>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-10">
              <h1>{title}</h1>
              <div className="description">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ImageArticle;
