"use client";

import { useMemo, useState, useEffect } from "react";
import Pagination from "@/components/Pagination";

type Project = {
  id: number;
  title: string;
  client: string;
  sector: string;
  category: string;
  year: number;
  location: string;
  value?: string;
  status?: string;
};

type Props = {
  initialProjects: Project[];
};

export default function ProjectsClient({ initialProjects }: Props) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [loading, setLoading] = useState(false);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/public/projects');
        if (response.ok) {
          const data = await response.json();
          if (data.projects && Array.isArray(data.projects)) {
            setProjects(data.projects);
          }
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        // Keep using initialProjects as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("All");
  const [category, setCategory] = useState("All");
  const [year, setYear] = useState("All");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: keyof Project; dir: 'asc' | 'desc' } | null>(null);
  const pageSize = 20;

  const years = useMemo(() => {
    const ys = new Set<number>();
    projects.forEach(p => ys.add(p.year));
    return Array.from(ys).sort((a, b) => b - a);
  }, [projects]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let rows = projects.filter(p => (
      (sector === "All" || p.sector === sector) &&
      (category === "All" || p.category === category) &&
      (year === "All" || String(p.year) === year) &&
      (!ql || `${p.title} ${p.client} ${p.location}`.toLowerCase().includes(ql))
    ));
    if (sort) {
      const { key, dir } = sort;
      rows = rows.slice().sort((a, b) => {
        const va = String(a[key] ?? "");
        const vb = String(b[key] ?? "");
        return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }
    return rows;
  }, [projects, q, sector, category, year, sort]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  const resetPage = () => setPage(1);

  const setSortKey = (key: keyof Project) => {
    setSort((s) => {
      if (!s || s.key !== key) return { key, dir: 'asc' };
      return { key, dir: s.dir === 'asc' ? 'desc' : 'asc' };
    });
  };

  return (
    <main className="main">
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Project Records</h2>
          <p>Browse previous project records with smart filters</p>
        </div>
        <div className="container">
          {/* Filters above table */}
          <div className="card shadow-sm mb-4" data-aos="fade-up">
            <div className="card-body p-3 p-md-4">
              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Search</label>
                  <input 
                    className="form-control" 
                    style={{ fontSize: '12px', padding: '8px 12px' }}
                    value={q} 
                    onChange={e => { setQ(e.target.value); resetPage(); }} 
                    placeholder="Search: title, client, location" 
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Sector</label>
                  <select 
                    className="form-select" 
                    style={{ fontSize: '12px', padding: '8px 12px' }}
                    value={sector} 
                    onChange={e => { setSector(e.target.value); resetPage(); }}
                  >
                    <option>All</option>
                    <option>Government</option>
                    <option>Private</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Category</label>
                  <select 
                    className="form-select" 
                    style={{ fontSize: '12px', padding: '8px 12px' }}
                    value={category} 
                    onChange={e => { setCategory(e.target.value); resetPage(); }}
                  >
                    <option>All</option>
                    <option>Civil Engineering</option>
                    <option>Mechanical &amp; Electrical Engineering</option>
                    <option>ICT Engineering</option>
                    <option>Project Management &amp; Consultancy</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Year</label>
                  <select 
                    className="form-select" 
                    style={{ fontSize: '12px', padding: '8px 12px' }}
                    value={year} 
                    onChange={e => { setYear(e.target.value); resetPage(); }}
                  >
                    <option>All</option>
                    {years.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div className="col-md-2 text-md-end">
                  <label className="form-label d-none d-md-block" style={{ fontSize: '12px' }}>&nbsp;</label>
                  <button 
                    className="btn btn-outline-secondary w-100" 
                    style={{ fontSize: '12px', padding: '8px 12px', fontWeight: 500 }}
                    onClick={() => { setQ(""); setSector("All"); setCategory("All"); setYear("All"); resetPage(); }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="card shadow-sm" data-aos="fade-up" data-aos-delay="100">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle" style={{fontSize: '11px'}}>
                  <thead className="table-light" style={{fontSize: '11px'}}>
                    <tr>
                      <th style={{width: 50, fontSize: '11px'}} className="text-center">#</th>
                      <th role="button" onClick={() => setSortKey('title')} style={{fontSize: '11px'}}>Title</th>
                      <th role="button" onClick={() => setSortKey('client')} style={{fontSize: '11px'}}>Client</th>
                      <th role="button" onClick={() => setSortKey('sector')} style={{fontSize: '11px'}}>Sector</th>
                      <th role="button" onClick={() => setSortKey('category')} style={{fontSize: '11px'}}>Category</th>
                      <th role="button" onClick={() => setSortKey('year')} style={{fontSize: '11px'}}>Year</th>
                      <th role="button" onClick={() => setSortKey('location')} style={{fontSize: '11px'}}>Location</th>
                      <th style={{fontSize: '11px'}}>Value</th>
                      <th style={{fontSize: '11px'}}>Status</th>
                    </tr>
                  </thead>
                  <tbody style={{fontSize: '11px'}}>
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="text-center py-5">
                          <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <span className="text-muted">Loading projects...</span>
                        </td>
                      </tr>
                    ) : current.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center text-muted py-5">No records found</td>
                      </tr>
                    ) : (
                      current.map((p, i) => (
                        <tr key={p.id}>
                          <td className="text-center">{(page - 1) * pageSize + i + 1}</td>
                          <td>{p.title}</td>
                          <td>{p.client}</td>
                          <td>{p.sector}</td>
                          <td>{p.category}</td>
                          <td>{p.year}</td>
                          <td>{p.location}</td>
                          <td>{p.value || '-'}</td>
                          <td>{p.status || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center p-3 border-top" style={{ gap: '12px' }}>
                <div className="text-muted" style={{ fontSize: '12px' }}>
                  Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
                </div>
                <Pagination 
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
