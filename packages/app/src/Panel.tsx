import React, { CSSProperties } from 'react';

interface HeadingProps {
  title?: React.ReactNode;
  explanation?: React.ReactNode;
  actions?: React.ReactNode;
  backButton?: React.ReactNode;
}
const Heading = ({ title, explanation, actions, backButton }: HeadingProps) => {
  if (!title) {
    return null;
  }

  let content = (
    <>
      <h1 style={{ position: 'relative' }}>
        {backButton && <div className="back-button">{backButton}</div>}

        {typeof title === 'string' ? (
          <a href={`#${title}`} id={title}>
            {title}
          </a>
        ) : (
          title
        )}
      </h1>
      {explanation && <small>{explanation}</small>}
    </>
  );

  if (actions) {
    content = (
      <div className="flex wrapable">
        <div className="flex-main">{content}</div>
        <div className="flex-sub action-buttons" style={{ margin: '10px 0' }}>
          {actions}
        </div>
      </div>
    );
  }

  return <div className="panel-heading">{content}</div>;
};

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  bodyStyle?: CSSProperties;
  pad?: boolean;
  // Heading
  title?: React.ReactNode;
  explanation?: React.ReactNode;
  actions?: React.ReactNode;
  backButton?: React.ReactNode;
}

const Panel = ({
  children,
  className = '',
  style,
  pad = true,
  title,
  explanation,
  actions,
  backButton,
  bodyStyle,
}: PanelProps) => (
  <div className={`panel ${className}`} style={style}>
    <Heading
      title={title}
      explanation={explanation}
      actions={actions}
      backButton={backButton}
    />
    <div className={`panel-body ${pad ? 'pad' : ''}`} style={bodyStyle}>
      {children}
    </div>
  </div>
);

export default Panel;
