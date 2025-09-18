"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

const GraphView = dynamic(() => import("./viewer/GraphView"), { ssr: false });

type CompMeta = { id: number; nodes: number; edges: number; };
type Company = {
  company: string;
  slug: string;
  totals: { components: number; nodes: number; edges: number; };
  components: CompMeta[];
};

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<{ slug: string; compId: number } | null>(null);

  useEffect(() => {
    fetch("/data/company_index.json")
      .then(r => r.json())
      .then(d => setCompanies(d.companies || []));
  }, []);

  const filtered = useMemo(() => {
    if (!query) return companies;
    const q = query.toLowerCase();
    return companies.filter(c =>
      c.company.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [companies, query]);

  return (
    <div style={{display:"grid", gridTemplateColumns:"360px 1fr", height:"100vh"}}>
      <aside style={{borderRight:"1px solid #ddd", padding:"12px", overflow:"auto"}}>
        <h3>Browse by company</h3>
        <input
          placeholder="Search company or ticker..."
          value={query}
          onChange={e=>setQuery(e.target.value)}
          style={{width:"100%", padding:"8px", margin:"8px 0 12px"}}
        />
        <div style={{fontSize:12, color:"#666", marginBottom:8}}>
          {filtered.length} companies
        </div>

        <ul style={{listStyle:"none", padding:0}}>
          {filtered.slice(0, 200).map(c => (
            <li key={c.slug} style={{marginBottom:10}}>
              <div style={{fontWeight:600}}>{c.company}</div>
              <div style={{fontSize:12, color:"#777", marginBottom:6}}>
                {c.totals.components} comps • {c.totals.nodes} nodes • {c.totals.edges} edges
              </div>
              <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                {c.components.slice(0, 8).map(m => (
                  <button
                    key={m.id}
                    onClick={()=>setSelected({ slug: c.slug, compId: m.id })}
                    style={{
                      border:"1px solid #ddd", padding:"4px 8px", borderRadius:6,
                      background: selected?.slug===c.slug && selected?.compId===m.id ? "#e8f1ff":"#fff",
                      cursor:"pointer"
                    }}
                  >
                    comp {m.id} · {m.nodes}/{m.edges}
                  </button>
                ))}
                {c.components.length > 8 && (
                  <span style={{fontSize:12, color:"#999"}}>+{c.components.length-8} more</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </aside>

      <main>
        {selected ? (
          <GraphView
            compId={selected.compId}
            // new: tell GraphView to load from /data/company/<slug>/comp_<id>.json
            basePath={`/data/company/${selected.slug}`}
          />
        ) : (
          <div style={{display:"grid", placeItems:"center", height:"100%"}}>
            <p>Select a company and a component.</p>
          </div>
        )}
      </main>
    </div>
  );
}
