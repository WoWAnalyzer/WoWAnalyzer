import ITEM_QUALITIES from './ITEM_QUALITIES';

export default function getItemQualityLabel(quality) {
  switch (quality) {
    case ITEM_QUALITIES.ARTIFACT:
      return 'artifact';
    case ITEM_QUALITIES.LEGENDARY:
      return 'legendary';
    case ITEM_QUALITIES.EPIC:
      return 'epic';
    case ITEM_QUALITIES.RARE:
      return 'rare';
    case ITEM_QUALITIES.UNCOMMON:
      return 'uncommon';
    case ITEM_QUALITIES.COMMON:
      return 'common';
    case ITEM_QUALITIES.POOR:
      return 'poor';
    default:
      return 'unknown';
  }
}
