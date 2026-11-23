// A browser-window frame: the visual shorthand for "we build websites".
export default function Browser({ url = '', children, className = '' }) {
  return (
    <div className={`browser ${className}`.trim()}>
      <div className="browser-bar" aria-hidden="true">
        <span className="browser-dots"><i /><i /><i /></span>
        <span className="browser-url">{url}</span>
      </div>
      {children}
    </div>
  );
}
