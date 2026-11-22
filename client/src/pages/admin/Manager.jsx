import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';

// Generic list + form editor for one resource. `fields` describes the form inputs.
export default function Manager({ resource, label, fields, blank, titleKey = 'title' }) {
  const [rows, setRows] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get(`/admin/${resource}`).then(setRows).catch((e) => setError(e.message));
  useEffect(() => { setEditing(null); setRows(null); load(); }, [resource]);

  async function save(e) {
    e.preventDefault();
    setError('');
    try {
      if (editing.id) await api.put(`/admin/${resource}/${editing.id}`, editing);
      else await api.post(`/admin/${resource}`, editing);
      setEditing(null);
      load();
    } catch (err) { setError(err.message); }
  }

  async function remove(row) {
    if (!confirm(`Delete "${row[titleKey]}"? This can't be undone.`)) return;
    try { await api.del(`/admin/${resource}/${row.id}`); load(); } catch (err) { setError(err.message); }
  }

  if (editing) {
    const upd = (name, value) => setEditing({ ...editing, [name]: value });
    return (
      <form onSubmit={save} className="stack">
        <h2>{editing.id ? `Edit ${label.toLowerCase()}` : `New ${label.toLowerCase()}`}</h2>
        {error && <p className="notice err" role="alert">{error}</p>}
        {fields.map((f) => (
          <label key={f.name} className={f.type === 'checkbox' ? 'check' : ''}>
            {f.label}
            {f.type === 'textarea' ? (
              <textarea rows={f.rows || 8} value={editing[f.name] ?? ''} onChange={(e) => upd(f.name, e.target.value)} />
            ) : f.type === 'checkbox' ? (
              <input type="checkbox" checked={!!editing[f.name]} onChange={(e) => upd(f.name, e.target.checked)} />
            ) : (
              <input type={f.type || 'text'} value={editing[f.name] ?? ''} placeholder={f.placeholder} required={f.required}
                onChange={(e) => upd(f.name, f.type === 'number' ? Number(e.target.value) : e.target.value)} />
            )}
          </label>
        ))}
        <div className="row">
          <button className="btn">Save {label.toLowerCase()}</button>
          <button type="button" className="btn ghost" onClick={() => { setEditing(null); setError(''); }}>Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <div className="row between">
        <h2>{label}s</h2>
        <button className="btn" onClick={() => { setError(''); setEditing({ ...blank }); }}>New {label.toLowerCase()}</button>
      </div>
      {error && <p className="notice err" role="alert">{error}</p>}
      {rows === null && <p className="muted">Loading…</p>}
      {rows?.length === 0 && <p className="muted">No {label.toLowerCase()}s yet. Create the first one.</p>}
      <ul className="list">
        {rows?.map((r) => (
          <li key={r.id}>
            <span>{r[titleKey]}{'published' in r && <em className="tag">{r.published ? 'Published' : 'Draft'}</em>}</span>
            <span className="row">
              <button className="btn ghost sm" onClick={() => { setError(''); setEditing(r); }}>Edit</button>
              <button className="btn ghost sm danger" onClick={() => remove(r)}>Delete</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
