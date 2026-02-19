import clsx from 'clsx';
import type { ReactNode } from 'react';
import { CSSProperties } from 'react';

interface HeadingProps {
  title?: ReactNode;
  subheading?: boolean;
  anchor?: string;
  explanation?: ReactNode;
  actions?: ReactNode;
  backButton?: ReactNode;
}

const Heading = ({ title, anchor, explanation, actions, backButton, subheading }: HeadingProps) => {
  if (title == null) return null;

  const renderedTitle = anchor ? (
    <a href={`#${anchor}`} id={anchor}>
      {title}
    </a>
  ) : (
    title
  );

  const HeadingTag = subheading ? 'h2' : 'h1';

  const headingBlock = (
    <>
      <HeadingTag style={{ position: 'relative' }}>
        {backButton && <div className="back-button">{backButton}</div>}
        {renderedTitle}
      </HeadingTag>
      {explanation && <small>{explanation}</small>}
    </>
  );

  return (
    <div className="panel-heading">
      {actions ? (
        <div className="flex wrapable">
          <div className="flex-main">{headingBlock}</div>
          <div className="flex-sub action-buttons" style={{ margin: '10px 0' }}>
            {actions}
          </div>
        </div>
      ) : (
        headingBlock
      )}
    </div>
  );
};

interface PanelProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  bodyStyle?: CSSProperties;
  pad?: boolean;
  // Heading
  title?: ReactNode;
  subheading?: boolean;
  anchor?: string;
  explanation?: ReactNode;
  actions?: ReactNode;
  backButton?: ReactNode;
}

const Panel = ({
  children,
  className = '',
  style,
  pad = true,
  title,
  subheading,
  anchor,
  explanation,
  actions,
  backButton,
  bodyStyle,
}: PanelProps) => (
  <div className={clsx('panel', className)} style={style}>
    {title !== null && title !== undefined && (
      <Heading
        title={title}
        subheading={subheading}
        anchor={anchor}
        explanation={explanation}
        actions={actions}
        backButton={backButton}
      />
    )}
    <div className={clsx('panel-body', { pad })} style={bodyStyle}>
      {children}
    </div>
  </div>
);

export default Panel;
