interface TimelineItemImageProps {
  source: string;
  description: string;
  wide?: boolean;
}
const TimelineItemImage = ({ source, description, wide }: TimelineItemImageProps) => (
  <figure style={wide ? { maxWidth: 800 } : undefined}>
    <a href={source} target="_blank" rel="noopener noreferrer">
      <img src={source} alt={description} />
    </a>
    <figcaption>{description}</figcaption>
  </figure>
);

export default TimelineItemImage;
