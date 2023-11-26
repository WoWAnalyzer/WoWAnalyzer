/**
 * A section within a section. This can be nested (so you'd have a
 * sub-sub-section). Don't go too crazy with that.
 */
const SubSection = ({ children, title, id, ...props }: React.ComponentProps<'div'>) => (
  <section className="subsection" id={id}>
    <header>{title || ''}</header>
    <div {...props}>{children}</div>
  </section>
);

export default SubSection;
