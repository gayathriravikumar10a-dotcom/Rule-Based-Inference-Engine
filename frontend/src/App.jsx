
import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowRight, BookOpen, BrainCircuit, CheckCircle2,
  ChevronDown, ChevronRight, CircleHelp, Cpu, Database,
  GitBranch, Home, Play, RefreshCw, Search, ShieldCheck,
  Sparkles, Target, Wifi, XCircle, Zap
} from "lucide-react";
import "./index.css";
import KnowledgeGraph from "./KnowledgeGraph";

const API = "http://127.0.0.1:8000";

const initialFacts = [
  "wifi_connected",
  "router_powered",
  "other_devices_online",
  "ping_ip_succeeds",
  "ping_domain_fails",
  "browser_fails",
  "airplane_mode_off",
  "ethernet_available",
  "vpn_disabled",
  "dns_lookup_fails",
];

const labels = {
  wifi_connected: "Wi-Fi connected",
  router_powered: "Router powered",
  other_devices_online: "Other devices online",
  ping_ip_succeeds: "Ping IP succeeds",
  ping_domain_fails: "Ping domain fails",
  browser_fails: "Browser fails",
  airplane_mode_off: "Airplane mode off",
  ethernet_available: "Ethernet available",
  vpn_disabled: "VPN disabled",
  dns_lookup_fails: "DNS lookup fails",
  local_network_available: "Local network available",
  router_likely_ok: "Router likely OK",
  internet_reachable: "Internet reachable",
  dns_issue: "DNS issue",
  browsing_failure_due_to_dns: "Browsing failure due to DNS",
  wireless_interface_active: "Wireless interface active",
  wifi_link_established: "Wi-Fi link established",
  shared_network_operational: "Shared network operational",
  possible_dns_outage: "Possible DNS outage",
};

const pretty = (value) =>
  labels[value] || String(value ?? "").replaceAll("_", " ") || "Unknown";

function App() {
  const [page, setPage] = useState("Dashboard");
  const [facts, setFacts] = useState(initialFacts);
  const [goal, setGoal] = useState("browsing_failure_due_to_dns");
  const [kb, setKb] = useState(null);
  const [health, setHealth] = useState("checking");
  const [forward, setForward] = useState(null);
  const [backward, setBackward] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedPass, setExpandedPass] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    checkBackend();
    loadKnowledgeBase();
  }, []);

  async function checkBackend() {
    try {
      const response = await fetch(`${API}/`);
      if (!response.ok) throw new Error("Backend unavailable");
      setHealth("online");
    } catch {
      setHealth("offline");
    }
  }

  async function loadKnowledgeBase() {
    try {
      const response = await fetch(`${API}/api/knowledge-base`);
      if (!response.ok) throw new Error("Could not load knowledge base");
      setKb(await response.json());
    } catch (err) {
      setError(err.message);
    }
  }

  function toggleFact(fact) {
    setFacts((current) =>
      current.includes(fact)
        ? current.filter((item) => item !== fact)
        : [...current, fact]
    );
  }

  async function runForward() {
    setLoading(true);
    setError("");
    setForward(null);

    try {
      const response = await fetch(`${API}/api/forward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facts }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Forward chaining failed");
      }

      setForward(data);
      setExpandedPass(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function runBackward() {
    setLoading(true);
    setError("");
    setBackward(null);

    try {
      const response = await fetch(`${API}/api/backward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facts, goal }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Backward chaining failed");
      }

      setBackward(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const rules = Array.isArray(kb?.rules) ? kb.rules : [];

  const filteredRules = useMemo(
    () =>
      rules.filter((rule) =>
        `${rule.id} ${rule.description} ${rule.conclusion} ${rule.conditions}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [rules, search]
  );

  const navItems = [
    { name: "Dashboard", icon: Home },
    { name: "Forward Chaining", icon: GitBranch },
    { name: "Backward Chaining", icon: Target },
    { name: "Knowledge Base", icon: Database },
    { name: "Knowledge Graph", icon: GitBranch },
  ];

  const Stat = ({ icon: Icon, label, value, detail }) => (
    <div className="stat-card">
      <div className="stat-icon"><Icon size={19} /></div>
      <div>
        <p className="muted">{label}</p>
        <h2>{value}</h2>
        <span className="stat-detail">{detail}</span>
      </div>
    </div>
  );

  const FactPicker = () => (
    <div className="fact-grid">
      {initialFacts.map((fact) => (
        <label
          className={`fact-option ${facts.includes(fact) ? "selected" : ""}`}
          key={fact}
        >
          <input
            type="checkbox"
            checked={facts.includes(fact)}
            onChange={() => toggleFact(fact)}
          />
          <span className="custom-check">
            {facts.includes(fact) && <CheckCircle2 size={15} />}
          </span>
          <span>{pretty(fact)}</span>
        </label>
      ))}
    </div>
  );

  const PageHeading = ({ eyebrow, title, description }) => (
    <div className="page-heading">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );

  function renderDashboard() {
    return (
      <>
        <div className="hero">
          <div className="hero-content">
            <div className="eyebrow"><Sparkles size={14} /> INTELLIGENT DIAGNOSTICS</div>
            <h1>Reason through<br /><span>the unknown.</span></h1>
            <p>
              Explore propositional logic through a rule-based inference engine.
              Diagnose network faults using forward and backward chaining.
            </p>
            <button className="primary-btn" onClick={() => setPage("Forward Chaining")}>
              Explore inference engine <ArrowRight size={17} />
            </button>
          </div>
          <div className="hero-graphic">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="hero-core"><BrainCircuit size={55} /></div>
            <div className="orbit-node node-one"><Wifi size={19} /></div>
            <div className="orbit-node node-two"><Database size={19} /></div>
            <div className="orbit-node node-three"><GitBranch size={19} /></div>
            <div className="orbit-node node-four"><Zap size={19} /></div>
          </div>
        </div>

        <div className="stats-grid">
          <Stat icon={Database} label="Knowledge facts" value={kb?.total_facts ?? 10} detail="Initial evidence base" />
          <Stat icon={GitBranch} label="Inference rules" value={kb?.total_rules ?? 17} detail="Logical IFâ€“THEN rules" />
          <Stat icon={Activity} label="Reasoning methods" value="02" detail="Forward + backward chaining" />
          <Stat icon={ShieldCheck} label="Logic engine" value="Active" detail="Deterministic reasoning" />
        </div>

        <div className="section-heading">
          <div><div className="eyebrow">REASONING WORKSPACE</div><h2>Choose your approach</h2></div>
        </div>

        <div className="approach-grid">
          <button className="approach-card" onClick={() => setPage("Forward Chaining")}>
            <div className="approach-icon purple"><GitBranch /></div>
            <span className="card-tag">DATA-DRIVEN</span>
            <h3>Forward Chaining</h3>
            <p>Start with known facts and repeatedly apply rules to discover new conclusions.</p>
            <span className="card-link">Start reasoning <ArrowRight size={16} /></span>
          </button>
          <button className="approach-card" onClick={() => setPage("Backward Chaining")}>
            <div className="approach-icon blue"><Target /></div>
            <span className="card-tag">GOAL-DRIVEN</span>
            <h3>Backward Chaining</h3>
            <p>Start with a hypothesis and work backwards to determine whether evidence supports it.</p>
            <span className="card-link">Prove a goal <ArrowRight size={16} /></span>
          </button>
          <button className="approach-card" onClick={() => setPage("Knowledge Base")}>
            <div className="approach-icon green"><BookOpen /></div>
            <span className="card-tag">SYSTEM RULES</span>
            <h3>Knowledge Base</h3>
            <p>Inspect facts, rule conditions and conclusions that power the inference engine.</p>
            <span className="card-link">Explore knowledge <ArrowRight size={16} /></span>
          </button>
        </div>
      </>
    );
  }

  function renderForward() {
    const passes = Array.isArray(forward?.passes) ? forward.passes : [];
    const finalFacts = Array.isArray(forward?.final_facts)
      ? forward.final_facts
      : [];
    const derivedFacts = Array.isArray(forward?.derived_facts)
      ? forward.derived_facts
      : [];

    return (
      <>
        <PageHeading
          eyebrow="DATA-DRIVEN REASONING"
          title="Forward Chaining"
          description="Provide initial evidence. The engine applies matching rules until no new facts can be derived."
        />

        <div className="workspace-grid">
          <section className="panel">
            <div className="panel-heading">
              <div><span className="eyebrow">STEP 01</span><h3>Initial facts</h3></div>
              <span className="count-pill">{facts.length} selected</span>
            </div>
            <p className="muted">Select the evidence currently observed in the network.</p>
            <FactPicker />
            <div className="panel-actions">
              <button className="secondary-btn" onClick={() => {
                setFacts(initialFacts);
                setForward(null);
              }}>
                <RefreshCw size={15} /> Reset
              </button>
              <button className="primary-btn" disabled={loading || !facts.length} onClick={runForward}>
                <Play size={15} /> {loading ? "Running..." : "Run forward chaining"}
              </button>
            </div>
          </section>

          <section className="panel explanation-panel">
            <div className="panel-heading">
              <div><span className="eyebrow">HOW IT WORKS</span><h3>Inference process</h3></div>
              <BrainCircuit size={22} />
            </div>
            <div className="process-list">
              {[
                ["01", "Load facts", "Begin with the evidence you selected."],
                ["02", "Match rules", "Check whether all rule conditions are satisfied."],
                ["03", "Derive conclusions", "Add new conclusions to working memory."],
                ["04", "Repeat until stable", "Stop when no more facts can be inferred."],
              ].map(([number, title, description]) => (
                <div key={number}>
                  <span>{number}</span>
                  <p><b>{title}</b><small>{description}</small></p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {forward && (
          <section className="panel result-panel">
            <div className="panel-heading">
              <div><span className="eyebrow">EXECUTION RESULT</span><h3>Inference trace</h3></div>
              <span className="success-pill"><CheckCircle2 size={14} /> Completed</span>
            </div>

            <div className="result-stats">
              <div><strong>{forward.total_passes ?? passes.length}</strong><span>Passes</span></div>
              <div><strong>{derivedFacts.length}</strong><span>New facts</span></div>
              <div><strong>{finalFacts.length}</strong><span>Final facts</span></div>
            </div>

            <h4>Pass-by-pass execution</h4>

            {passes.map((pass, index) => {
              const newFacts = Array.isArray(pass.new_facts)
                ? pass.new_facts
                : typeof pass.new_facts === "string"
                  ? [pass.new_facts]
                  : [];

              const ruleResults = Array.isArray(pass.rules)
                ? pass.rules
                : Array.isArray(pass.rule_results)
                  ? pass.rule_results
                  : [];

              return (
                <div className="trace-card" key={index}>
                  <button className="trace-toggle" onClick={() =>
                    setExpandedPass(expandedPass === index ? -1 : index)
                  }>
                    <span><span className="trace-number">PASS {index + 1}</span>{newFacts.length} new facts</span>
                    {expandedPass === index ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>

                  {expandedPass === index && (
                    <div className="trace-body">
                      {ruleResults.map((item, i) => (
                        <div className="trace-rule" key={i}>
                          <span className="rule-status">{item.status || item.result || "RULE"}</span>
                          <span>{item.rule_id || item.id || `R${i + 1}`}</span>
                          <span>{item.description || item.conclusion || item.message || ""}</span>
                        </div>
                      ))}
                      {newFacts.map((fact, i) => (
                        <div className="derived-line" key={i}>
                          <CheckCircle2 size={14} /> {pretty(fact)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <h4>Final knowledge state</h4>
            <div className="fact-result-grid">
              {finalFacts.map((fact) => (
                <span key={fact}><CheckCircle2 size={14} /> {pretty(fact)}</span>
              ))}
            </div>
          </section>
        )}
      </>
    );
  }

  function renderBackward() {
    const trace = Array.isArray(backward?.trace) ? backward.trace : [];
    const proven = backward?.answer === "YES" || backward?.proven === true || backward?.result === "YES";

    return (
      <>
        <PageHeading
          eyebrow="GOAL-DRIVEN REASONING"
          title="Backward Chaining"
          description="Choose a hypothesis. The engine searches for rules that can prove it, then recursively checks their conditions."
        />

        <div className="workspace-grid">
          <section className="panel">
            <div className="panel-heading">
              <div><span className="eyebrow">STEP 01</span><h3>Define your goal</h3></div>
              <Target size={22} />
            </div>
            <label className="field-label">Target proposition</label>
            <input className="text-input" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Enter a goal, e.g. dns_issue" />
            <p className="muted">Use a proposition name from the knowledge base or enter your own.</p>
            <div className="divider" />
            <div className="panel-heading">
              <h3>Available evidence</h3>
              <span className="count-pill">{facts.length} selected</span>
            </div>
            <FactPicker />
            <div className="panel-actions">
              <button className="secondary-btn" onClick={() => {
                setFacts(initialFacts);
                setBackward(null);
              }}>
                <RefreshCw size={15} /> Reset
              </button>
              <button className="primary-btn" disabled={loading || !goal.trim()} onClick={runBackward}>
                <Play size={15} /> {loading ? "Proving..." : "Prove goal"}
              </button>
            </div>
          </section>

          <section className="panel explanation-panel">
            <div className="panel-heading">
              <div><span className="eyebrow">PROOF STRATEGY</span><h3>Backward reasoning</h3></div>
              <Target size={22} />
            </div>
            <div className="process-list">
              <div><span>01</span><p><b>Set a goal</b><small>Identify the proposition to prove.</small></p></div>
              <div><span>02</span><p><b>Find supporting rules</b><small>Search for rules whose conclusion matches the goal.</small></p></div>
              <div><span>03</span><p><b>Prove conditions</b><small>Recursively test every required condition.</small></p></div>
              <div><span>04</span><p><b>Return verdict</b><small>Report whether the goal can be established.</small></p></div>
            </div>
          </section>
        </div>

        {backward && (
          <section className="panel result-panel">
            <div className="panel-heading">
              <div><span className="eyebrow">PROOF RESULT</span><h3>Goal evaluation</h3></div>
              <span className={proven ? "success-pill" : "failure-pill"}>{proven ? "YES" : "NO"}</span>
            </div>
            <div className="verdict-card">
              {proven ? <CheckCircle2 size={30} /> : <XCircle size={30} />}
              <div>
                <h2>{proven ? "Goal proved" : "Goal not proved"}</h2>
                <p>{pretty(backward.goal || goal)}</p>
              </div>
            </div>
            <h4>Proof trace</h4>
            <div className="proof-trace">
              {trace.map((item, index) => (
                <div className="proof-step" key={index}>
                  <span className="proof-index">{index + 1}</span>
                  <div>
                    <b>{item.action || item.status || item.event || "Reasoning step"}</b>
                    <p>{item.goal || item.fact || item.rule_id || item.message || item.description || JSON.stringify(item)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </>
    );
  }

  function renderKnowledge() {
    const initialKnowledgeFacts = Array.isArray(kb?.initial_facts) ? kb.initial_facts : [];

    return (
      <>
        <PageHeading
          eyebrow="SYSTEM KNOWLEDGE"
          title="Knowledge Base"
          description="Inspect the propositions and logical rules used by the inference engine."
        />

        <div className="stats-grid compact-stats">
          <Stat icon={Database} label="Initial facts" value={initialKnowledgeFacts.length} detail="Available evidence" />
          <Stat icon={GitBranch} label="Inference rules" value={rules.length} detail="Logical relationships" />
        </div>

        <section className="panel">
          <div className="panel-heading">
            <div><span className="eyebrow">PROPOSITION SET</span><h3>Initial facts</h3></div>
            <span className="count-pill">{initialKnowledgeFacts.length} facts</span>
          </div>
          <div className="fact-result-grid">
            {initialKnowledgeFacts.map((fact) => (
              <span key={fact}><CheckCircle2 size={14} /> {pretty(fact)}</span>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div><span className="eyebrow">LOGICAL RULES</span><h3>Rule explorer</h3></div>
            <span className="count-pill">{filteredRules.length} rules</span>
          </div>
          <div className="search-box">
            <Search size={17} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search rules, facts or conclusions..." />
          </div>
          <div className="rules-list">
            {filteredRules.map((rule, index) => (
              <div className="rule-card" key={rule.id || index}>
                <div className="rule-id">{rule.id || `R${index + 1}`}</div>
                <div className="rule-content">
                  <p>{rule.description || "Inference rule"}</p>
                  <div className="logic-expression">
                    <div>
                      <small>IF</small>
                      {(Array.isArray(rule.conditions) ? rule.conditions : []).map((condition) => (
                        <span key={condition}>{pretty(condition)}</span>
                      ))}
                    </div>
                    <ArrowRight size={17} />
                    <div><small>THEN</small><span className="conclusion">{pretty(rule.conclusion)}</span></div>
                  </div>
                </div>
              </div>
            ))}
            {!filteredRules.length && <p className="muted">No matching rules found.</p>}
          </div>
        </section>
      </>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><BrainCircuit size={22} /></div>
          <div><b>RULE ENGINE</b><small>INFERENCE SYSTEM</small></div>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav>
          {navItems.map(({ name, icon: Icon }) => (
            <button key={name} className={`nav-item ${page === name ? "active" : ""}`} onClick={() => setPage(name)}>
              <Icon size={18} />
              <span>{name}</span>
              {page === name && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="engine-status">
            <span className={`status-dot ${health}`} />
            <div>
              <b>Backend status</b>
              <small>{health === "online" ? "Connected Â· API ready" : health === "offline" ? "Disconnected" : "Checking connection..."}</small>
            </div>
          </div>
          <div className="sidebar-version">LAB 3 Â· PROPOSITIONAL LOGIC<br />VERSION 1.0.0</div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Workspace <ChevronRight size={14} /> <b>{page}</b></div>
          <div className="topbar-right">
            <span className="system-chip">
              <span className={`status-dot ${health}`} />
              {health === "online" ? "SYSTEM ONLINE" : health === "offline" ? "SYSTEM OFFLINE" : "CONNECTING"}
            </span>
            <div className="avatar"><Cpu size={17} /></div>
          </div>
        </header>

        <div className="page-content">
          {error && (
            <div className="error-banner">
              <CircleHelp size={17} /> {error}
              <button onClick={() => setError("")}><XCircle size={16} /></button>
            </div>
          )}

          {page === "Dashboard" && renderDashboard()}
          {page === "Forward Chaining" && renderForward()}
          {page === "Backward Chaining" && renderBackward()}
          {page === "Knowledge Base" && renderKnowledge()}
          {page === "Knowledge Graph" && (
            <>
              <PageHeading eyebrow="VISUAL KNOWLEDGE" title="Knowledge Graph" description="Explore how facts connect to inference rules and derived conclusions." />
              <KnowledgeGraph />
            </>
          )}

          <footer>RULE-BASED INFERENCE ENGINE <span>Â·</span> PROPOSITIONAL LOGIC <span>Â·</span> LAB 3</footer>
        </div>
      </main>
    </div>
  );
}

export default App;

