// A generated cover for each project: a colour field derived from its name, so every project looks distinct without needing a screenshot.
export default function Cover({ project, large = false }) {
  const seed = project.slug || project.title || '';
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return (
    <div className={`cover${large ? ' cover-lg' : ''}`} style={{ '--h': h }} aria-hidden="true">
      <span className="cover-mark">{(project.title || '?').charAt(0)}</span>
    </div>
  );
}
