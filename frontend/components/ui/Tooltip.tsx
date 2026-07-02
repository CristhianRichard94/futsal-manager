function Tooltip({
  children,
  content,
}: {
  children: React.ReactNode;
  content: string;
}) {
  return (
    <span className="tooltip" data-tooltip-content={content}>
      {children}
      <span className="tooltip-text">{content}</span>
    </span>
  );
}

export default Tooltip;
