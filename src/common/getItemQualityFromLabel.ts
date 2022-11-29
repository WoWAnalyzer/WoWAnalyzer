import { ITEM_QUALITIES } from 'game/ITEM_QUALITIES';

export default function getItemQualityFromLabel(quality?: string): ITEM_QUALITIES {
  switch (quality) {
    case 'artifact':
      return ITEM_QUALITIES.ARTIFACT;
    case 'legendary':
      return ITEM_QUALITIES.LEGENDARY;
    case 'epic':
      return ITEM_QUALITIES.EPIC;
    case 'rare':
      return ITEM_QUALITIES.RARE;
    case 'uncommon':
      return ITEM_QUALITIES.UNCOMMON;
    case 'common':
      return ITEM_QUALITIES.COMMON;
    default:
      return ITEM_QUALITIES.POOR;
  }
}
