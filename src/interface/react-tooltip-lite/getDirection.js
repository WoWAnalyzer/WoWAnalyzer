/**
 * Checks the intended tip direction and falls back if not enough space
 */
import { getScrollLeft, getArrowSpacing } from './position';

function checkLeftRightWidthSufficient(tip, target, distance, bodyPadding) {
  const targetRect = target.getBoundingClientRect();
  const deadSpace = Math.min(
    targetRect.left,
    document.documentElement.clientWidth - targetRect.right,
  );

  return (
    tip.offsetWidth + target.offsetWidth + distance + bodyPadding + deadSpace <
    document.documentElement.clientWidth
  );
}

function checkTargetFullyVisible(target) {
  const bottomOverhang = target.getBoundingClientRect().bottom > window.innerHeight;
  const topOverhang = target.getBoundingClientRect().top < 0;

  return !bottomOverhang && !topOverhang;
}

function checkForArrowOverhang(props, arrowStyles, bodyPadding) {
  const scrollLeft = getScrollLeft();
  const hasLeftClearance = arrowStyles.left - scrollLeft > bodyPadding;
  const hasRightClearance =
    arrowStyles.left + props.arrowSize * 2 <
    scrollLeft + document.documentElement.clientWidth - bodyPadding;

  return !hasLeftClearance || !hasRightClearance;
}

export default function getDirection(
  currentDirection,
  tip,
  target,
  props,
  bodyPadding,
  arrowStyles,
  recursive,
) {
  // can't switch until target is rendered
  if (!target) {
    return currentDirection;
  }

  const targetRect = target.getBoundingClientRect();
  const arrowSpacing = getArrowSpacing(props);

  // this is how much space is needed to display the tip above or below the target
  const heightOfTipWithArrow = tip.offsetHeight + arrowSpacing + bodyPadding;

  const spaceBelowTarget = window.innerHeight - targetRect.bottom;
  const spaceAboveTarget = targetRect.top;

  const hasSpaceBelow = spaceBelowTarget >= heightOfTipWithArrow;
  const hasSpaceAbove = spaceAboveTarget >= heightOfTipWithArrow;

  switch (currentDirection) {
    case 'right':
      // if the window is not wide enough try top (which falls back to down)
      if (
        !checkLeftRightWidthSufficient(tip, target, arrowSpacing, bodyPadding) ||
        !checkTargetFullyVisible(target)
      ) {
        return getDirection('up', tip, target, arrowSpacing, bodyPadding, arrowStyles, true);
      }

      if (
        document.documentElement.clientWidth - targetRect.right <
        tip.offsetWidth + arrowSpacing + bodyPadding
      ) {
        return 'left';
      }

      return 'right';

    case 'left':
      // if the window is not wide enough try top (which falls back to down)
      if (
        !checkLeftRightWidthSufficient(tip, target, arrowSpacing, bodyPadding) ||
        !checkTargetFullyVisible(target)
      ) {
        return getDirection('up', tip, target, arrowSpacing, bodyPadding, arrowStyles, true);
      }

      if (targetRect.left < tip.offsetWidth + arrowSpacing + bodyPadding) {
        return 'right';
      }

      return 'left';

    case 'up':
      if (!recursive && arrowStyles && checkForArrowOverhang(props, arrowStyles, bodyPadding)) {
        return getDirection('left', tip, target, arrowSpacing, bodyPadding, arrowStyles, true);
      }

      if (!hasSpaceAbove) {
        if (hasSpaceBelow) {
          return 'down';
        } else if (checkLeftRightWidthSufficient(tip, target, arrowSpacing, bodyPadding)) {
          return getDirection('right', tip, target, arrowSpacing, bodyPadding, arrowStyles, true);
        }
      }

      return 'up';

    case 'down':
    default:
      if (!recursive && arrowStyles && checkForArrowOverhang(props, arrowStyles, bodyPadding)) {
        return getDirection('right', tip, target, arrowSpacing, bodyPadding, arrowStyles, true);
      }

      if (!hasSpaceBelow) {
        // if there's no space below, but space above, switch to that direction
        if (hasSpaceAbove) {
          return 'up';

          // if there's no space above or below, check if there would be space left or right
        } else if (checkLeftRightWidthSufficient(tip, target, arrowSpacing, bodyPadding)) {
          return getDirection('right', tip, target, arrowSpacing, bodyPadding, arrowStyles, true);
        }

        // if there's no space in any direction, default to the original direction
      }

      return 'down';
  }
}
