/**
 * @file positions.js
 * @description some functions for position calculation
 */

import getDirection from './getDirection';

const bodyPadding = 10;
const minArrowPadding = 5;
const noArrowDistance = 3;

/**
 * cross browser scroll positions
 */
function getScrollTop() {
  return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
}

export function getScrollLeft() {
  return window.scrollX || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
}

/**
 * Sets tip max width safely for mobile
 */
function getTipMaxWidth() {
  return typeof document !== 'undefined'
    ? document.documentElement.clientWidth - bodyPadding * 2
    : 1000;
}

/**
 * Parses align mode from direction if specified with hyphen, defaulting to middle if not -
 * e.g. 'left-start' is mode 'start' and 'left' would be the default of 'middle'
 */
function parseAlignMode(direction) {
  const directionArray = direction.split('-');
  if (directionArray.length > 1) {
    return directionArray[1];
  }
  return 'middle';
}

export function getArrowSpacing(props) {
  const defaultArrowSpacing = props.arrow ? props.arrowSize : noArrowDistance;
  return typeof props.distance === 'number' ? props.distance : defaultArrowSpacing;
}

/**
 * Gets wrapper's left position for top/bottom tooltips as well as needed width restriction
 */
function getUpDownPosition(tip, target, direction, alignMode, props) {
  let left = -10000000;
  let top;

  const arrowSpacing = getArrowSpacing(props);

  if (tip) {
    // get wrapper left position
    const scrollLeft = getScrollLeft();
    const targetRect = target.getBoundingClientRect();
    const targetLeft = targetRect.left + scrollLeft;

    const halfTargetWidth = Math.round(target.offsetWidth / 2);
    const tipWidth = Math.min(getTipMaxWidth(), tip.offsetWidth);
    const arrowCenter = targetLeft + halfTargetWidth;
    const arrowLeft = arrowCenter - props.arrowSize;
    const arrowRight = arrowCenter + props.arrowSize;

    if (alignMode === 'start') {
      left = props.arrow ? Math.min(arrowLeft, targetLeft) : targetLeft;
    } else if (alignMode === 'end') {
      const rightWithArrow = Math.max(arrowRight, targetLeft + target.offsetWidth);
      const rightEdge = props.arrow ? rightWithArrow : targetLeft + target.offsetWidth;
      left = Math.max(rightEdge - tipWidth, bodyPadding + scrollLeft);
    } else {
      const centeredLeft = targetLeft + halfTargetWidth - Math.round(tipWidth / 2);
      const availableSpaceOnLeft = bodyPadding + scrollLeft;

      left = Math.max(centeredLeft, availableSpaceOnLeft);
    }

    // check for right overhang
    const rightOfTip = left + tipWidth;
    const rightOfScreen = scrollLeft + document.documentElement.clientWidth - bodyPadding;
    const rightOverhang = rightOfTip - rightOfScreen;
    if (rightOverhang > 0) {
      left -= rightOverhang;
    }

    if (direction === 'up') {
      top = targetRect.top + getScrollTop() - (tip.offsetHeight + arrowSpacing);
    } else {
      top = targetRect.bottom + getScrollTop() + arrowSpacing;
    }
  }

  return {
    left,
    top,
  };
}

/**
 * gets top position for left/right arrows
 */
function getLeftRightPosition(tip, target, direction, alignMode, props) {
  let left = -10000000;
  let top = 0;

  const arrowSpacing = getArrowSpacing(props);
  const arrowPadding = props.arrow ? minArrowPadding : 0;

  if (tip) {
    const scrollTop = getScrollTop();
    const scrollLeft = getScrollLeft();
    const targetRect = target.getBoundingClientRect();
    const targetTop = targetRect.top + scrollTop;
    const halfTargetHeight = Math.round(target.offsetHeight / 2);
    const arrowTop = targetTop + halfTargetHeight - props.arrowSize;
    const arrowBottom = targetRect.top + scrollTop + halfTargetHeight + props.arrowSize;

    // TODO: handle close to edges better
    if (alignMode === 'start') {
      top = props.arrow ? Math.min(targetTop, arrowTop) : targetTop;
    } else if (alignMode === 'end') {
      const topForBottomAlign = targetRect.bottom + scrollTop - tip.offsetHeight;
      top = props.arrow
        ? Math.max(topForBottomAlign, arrowBottom - tip.offsetHeight)
        : topForBottomAlign;
    } else {
      // default to middle, but don't go below body
      const centeredTop = Math.max(
        targetTop + halfTargetHeight - Math.round(tip.offsetHeight / 2),
        bodyPadding + scrollTop,
      );

      // make sure it doesn't go below the arrow
      top = Math.min(centeredTop, arrowTop - arrowPadding);
    }

    // check for bottom overhang
    const bottomOverhang = top - scrollTop + tip.offsetHeight + bodyPadding - window.innerHeight;
    if (bottomOverhang > 0) {
      // try to add the body padding below the tip, but don't offset too far from the arrow
      top = Math.max(top - bottomOverhang, arrowBottom + arrowPadding - tip.offsetHeight);
    }

    if (direction === 'right') {
      left = targetRect.right + arrowSpacing + scrollLeft;
    } else {
      left = targetRect.left - arrowSpacing - tip.offsetWidth + scrollLeft;
    }
  }

  return {
    left,
    top,
  };
}

/**
 * sets the Arrow styles based on direction
 */
function getArrowStyles(target, direction, props) {
  if (!target) {
    return null;
  }

  const targetRect = target.getBoundingClientRect();
  const halfTargetHeight = Math.round(target.offsetHeight / 2);
  const halfTargetWidth = Math.round(target.offsetWidth / 2);
  const scrollTop = getScrollTop();
  const scrollLeft = getScrollLeft();
  const arrowSpacing = getArrowSpacing(props);
  const borderStyles = {};

  switch (direction) {
    case 'right':
      borderStyles.borderTop = `${props.arrowSize}px solid transparent`;
      borderStyles.borderBottom = `${props.arrowSize}px solid transparent`;

      if (props.background) {
        borderStyles.borderRight = `${props.arrowSize}px solid ${props.background}`;
      } else {
        borderStyles.borderRightWidth = `${props.arrowSize}px`;
        borderStyles.borderRightStyle = 'solid';
      }

      return {
        ...borderStyles,
        top: targetRect.top + scrollTop + halfTargetHeight - props.arrowSize,
        left: targetRect.right + scrollLeft + arrowSpacing - props.arrowSize,
      };

    case 'left':
      borderStyles.borderTop = `${props.arrowSize}px solid transparent`;
      borderStyles.borderBottom = `${props.arrowSize}px solid transparent`;

      if (props.background) {
        borderStyles.borderLeft = `${props.arrowSize}px solid ${props.background}`;
      } else {
        borderStyles.borderLeftWidth = `${props.arrowSize}px`;
        borderStyles.borderLeftStyle = 'solid';
      }

      return {
        ...borderStyles,
        top: targetRect.top + scrollTop + halfTargetHeight - props.arrowSize,
        left: targetRect.left + scrollLeft - arrowSpacing - 1,
      };

    case 'up':
      borderStyles.borderLeft = `${props.arrowSize}px solid transparent`;
      borderStyles.borderRight = `${props.arrowSize}px solid transparent`;

      // if color is styled with css, we need everything except border-color, if styled with props, we add entire border rule
      if (props.background) {
        borderStyles.borderTop = `${props.arrowSize}px solid ${props.background}`;
      } else {
        borderStyles.borderTopWidth = `${props.arrowSize}px`;
        borderStyles.borderTopStyle = 'solid';
      }

      return {
        ...borderStyles,
        left: Math.min(
          getScrollLeft() + getTipMaxWidth() - bodyPadding,
          targetRect.left + scrollLeft + halfTargetWidth - props.arrowSize,
        ),
        top: targetRect.top + scrollTop - arrowSpacing,
      };

    case 'down':
    default:
      borderStyles.borderLeft = `${props.arrowSize}px solid transparent`;
      borderStyles.borderRight = `${props.arrowSize}px solid transparent`;

      if (props.background) {
        borderStyles.borderBottom = `10px solid ${props.background}`;
      } else {
        borderStyles.borderBottomWidth = `${props.arrowSize}px`;
        borderStyles.borderBottomStyle = 'solid';
      }

      return {
        ...borderStyles,
        left: Math.min(
          getScrollLeft() + getTipMaxWidth() - bodyPadding,
          targetRect.left + scrollLeft + halfTargetWidth - props.arrowSize,
        ),
        top: targetRect.bottom + scrollTop + arrowSpacing - props.arrowSize,
      };
  }
}

/**
 * Returns the positions style rules
 */
export default function positions(direction, tip, target, props) {
  const alignMode = parseAlignMode(direction);
  const trimmedDirection = direction.split('-')[0];

  let realDirection = trimmedDirection;
  if (tip) {
    const testArrowStyles = props.arrow && getArrowStyles(target, trimmedDirection, props);
    realDirection = getDirection(
      trimmedDirection,
      tip,
      target,
      props,
      bodyPadding,
      testArrowStyles,
    );
  }

  const maxWidth = getTipMaxWidth();

  // force the tip to display the width we measured everything at when visible, when scrolled
  let width;
  if (tip && getScrollLeft() > 0) {
    // adding the exact width on the first render forces a bogus line break, so add 1px the first time
    const spacer = tip.style.width ? 0 : 1;
    width = Math.min(tip.offsetWidth, maxWidth) + spacer;
  }

  const tipPosition =
    realDirection === 'up' || realDirection === 'down'
      ? getUpDownPosition(tip, target, realDirection, alignMode, props)
      : getLeftRightPosition(tip, target, realDirection, alignMode, props);

  return {
    tip: {
      ...tipPosition,
      maxWidth,
      width,
    },
    arrow: tip && props.arrow ? getArrowStyles(target, realDirection, props) : null,
    realDirection,
  };
}
