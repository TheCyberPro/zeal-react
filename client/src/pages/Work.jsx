import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import WorkList from '../components/WorkList.jsx';
import ConfidentialWork from '../components/ConfidentialWork.jsx';

export default function Work() {
  const [projects, setProjects] = useState(null);
  useEffect(() => { api.get('/projects').then(setProjects).catch(() => setProjects([])); }, []);

  return (
    <section className="wrap section">
      <h1 className="page-title">Work</h1>
      {projects === null && <p className="muted">Loading…</p>}
      {projects?.length === 0 && <p className="muted">No projects published yet.</p>}
      {projects && <WorkList items={projects} />}
      <ConfidentialWork />
    </section>
  );
}
