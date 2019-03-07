import React from 'react';
import PropTypes from 'prop-types';

const Heading = ({ title, explanation, actions, backButton }) => {
  if (!title) {
    return null;
  }

  let content = (
    <>
      <h1 style={{ position: 'relative' }}>
        {backButton && (
          <div className="back-button">
            {backButton}
          </div>
        )}

        <a href={`#${title}`} id={title}>{title}</a>
      </h1>
      {explanation && <small>{explanation}</small>}
    </>
  );

  if (actions) {
    content = (
      <div className="flex">
        <div className="flex-main">
          {content}
        </div>
        <div className="flex-sub action-buttons">
          {actions}
        </div>
      </div>
    );
  }

  return (
    <div className="panel-heading">
      {content}
    </div>
  );
};
Heading.propTypes = {
  title: PropTypes.node,
  explanation: PropTypes.node,
  actions: PropTypes.node,
  backButton: PropTypes.node,
};

const Panel = ({ children, className, style, pad, title, explanation, actions, backButton, bodyStyle }) => (
  <div className={`panel ${className}`} style={style}>
    <Heading title={title} explanation={explanation} actions={actions} backButton={backButton} />
    <div className={`panel-body ${pad ? 'pad' : ''}`} style={bodyStyle}>
      {children}
    </div>
  </div>
);
Panel.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
  bodyStyle: PropTypes.object,
  pad: PropTypes.bool,
  // Heading
  title: PropTypes.node,
  explanation: PropTypes.node,
  actions: PropTypes.node,
  backButton: PropTypes.node,
};
Panel.defaultProps = {
  pad: true,
  className: '',
};

export default Panel;
