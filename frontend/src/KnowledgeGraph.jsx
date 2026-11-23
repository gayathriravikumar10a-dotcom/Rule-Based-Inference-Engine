import { useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";


const API = "http://127.0.0.1:8000";

const colors = {
  fact: { background: "#172d4a", border: "#3987e8", color: "#dbeafe" },
  rule: { background: "#30234e", border: "#a78bfa", color: "#ede9fe" },
  conclusion: { background: "#143b32", border: "#34d399", color: "#d1fae5" },
};

function getId(value) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (value && typeof value === "object") {
    return String(value.id ?? value.name ?? value.fact ?? value.conclusion ?? value.label ?? "");
  }
  return String(value ?? "");
}

function getConditions(rule) {
  const conditions = rule.conditions ?? rule.antecedents ?? rule.premises ?? rule.if ?? rule.facts ?? [];
  if (Array.isArray(conditions)) return conditions.map(getId);
  if (typeof conditions === "string") return [conditions];
  return [];
}

function getConclusion(rule) {
  return getId(rule.conclusion ?? rule.then ?? rule.result ?? rule.output ?? "");
}

function getRuleName(rule, index) {
  return String(rule.id ?? rule.rule_id ?? rule.name ?? `R${index + 1}`);
}

function makeNode(id, label, type, position) {
  const theme = colors[type];
  return {
    id,
    type: "default",
    position,
    data: { label },
    style: {
      background: theme.background,
      border: `1px solid ${theme.border}`,
      color: theme.color,
      borderRadius: "10px",
      padding: "12px 16px",
      minWidth: "150px",
      maxWidth: "230px",
      fontSize: "12px",
      fontWeight: 600,
      textAlign: "center",
      whiteSpace: "pre-line",
      boxShadow: "0 5px 18px rgba(0,0,0,0.18)",
    },
  };
}

function makeEdge(id, source, target) {
  return {
    id,
    source,
    target,
    animated: true,
    style: { stroke: "#64748b", strokeWidth: 1.8 },
  };
}

export default function KnowledgeGraph() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [counts, setCounts] = useState({ facts: 0, rules: 0, conclusions: 0 });

  useEffect(() => {
    let active = true;

    async function loadKnowledgeGraph() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API}/api/knowledge-base`);
        if (!response.ok) throw new Error("Could not load the knowledge base.");

        const data = await response.json();
        const initialFacts = Array.isArray(data.initial_facts) ? data.initial_facts : [];
        const rules = Array.isArray(data.rules) ? data.rules : [];

        const factSet = new Set(initialFacts.map(getId));
        rules.forEach((rule) => {
          getConditions(rule).forEach((fact) => factSet.add(fact));
        });

        const conclusions = new Set(rules.map(getConclusion).filter(Boolean));
        const allFacts = [...factSet];

        const graphNodes = [];
        const graphEdges = [];
        const factPositions = new Map();
        const conclusionPositions = new Map();

        const columnGap = 300;
        const rowGap = 105;

        allFacts.forEach((fact, index) => {
          const id = `fact-${fact}`;
          factPositions.set(fact, id);
          graphNodes.push(makeNode(id, `FACT\n${fact}`, "fact", {
            x: 40,
            y: index * rowGap + 40,
          }));
        });

        rules.forEach((rule, index) => {
          const ruleName = getRuleName(rule, index);
          const ruleId = `rule-${ruleName}`;
          const conditions = getConditions(rule);
          const conclusion = getConclusion(rule);

          graphNodes.push(makeNode(
            ruleId,
            `${ruleName}\n${conditions.join(" AND ") || "No conditions"}\n────────\n${conclusion || "No conclusion"}`,
            "rule",
            { x: columnGap, y: index * rowGap + 40 }
          ));

          conditions.forEach((condition) => {
            const sourceId = factPositions.get(condition);
            if (sourceId) {
              graphEdges.push(makeEdge(`edge-${sourceId}-${ruleId}`, sourceId, ruleId));
            }
          });

          if (conclusion) {
            const conclusionId = `conclusion-${conclusion}`;

            if (!conclusionPositions.has(conclusion)) {
              conclusionPositions.set(conclusion, conclusionId);
              graphNodes.push(makeNode(
                conclusionId,
                `CONCLUSION\n${conclusion}`,
                "conclusion",
                {
                  x: columnGap * 2,
                  y: [...conclusions].indexOf(conclusion) * rowGap + 40,
                }
              ));
            }

            graphEdges.push(makeEdge(`edge-${ruleId}-${conclusionId}`, ruleId, conclusionId));
          }
        });

        if (!active) return;

        setNodes(graphNodes);
        setEdges(graphEdges);
        setCounts({
          facts: allFacts.length,
          rules: rules.length,
          conclusions: conclusions.size,
        });
      } catch (err) {
        if (active) setError(err.message || "Something went wrong.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadKnowledgeGraph();
    return () => { active = false; };
  }, []);

  function handleNodesChange(changes) {
    const changeList = Array.isArray(changes) ? changes : [changes];

    setNodes((currentNodes) => {
      let updatedNodes = [...currentNodes];

      changeList.forEach((change) => {
        if (!change || !change.type) return;

        if (change.type === "position") {
          updatedNodes = updatedNodes.map((node) =>
            node.id === change.id
              ? {
                  ...node,
                  ...(change.position ? { position: change.position } : {}),
                  ...(change.dragging !== undefined ? { dragging: change.dragging } : {}),
                }
              : node
          );
        }

        if (change.type === "select") {
          updatedNodes = updatedNodes.map((node) =>
            node.id === change.id ? { ...node, selected: change.selected } : node
          );
        }

        if (change.type === "remove") {
          updatedNodes = updatedNodes.filter((node) => node.id !== change.id);
        }
      });

      return updatedNodes;
    });
  }

  if (loading) {
    return <div style={styles.message}>Loading knowledge graph...</div>;
  }

  if (error) {
    return (
      <div style={styles.error}>
        <strong>Unable to load knowledge graph</strong>
        <p>{error}</p>
        <button style={styles.button} onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.summary}>
        <div style={styles.stat}><span style={{ ...styles.dot, background: colors.fact.border }} />Facts <strong>{counts.facts}</strong></div>
        <div style={styles.stat}><span style={{ ...styles.dot, background: colors.rule.border }} />Rules <strong>{counts.rules}</strong></div>
        <div style={styles.stat}><span style={{ ...styles.dot, background: colors.conclusion.border }} />Conclusions <strong>{counts.conclusions}</strong></div>
      </div>

      <div style={styles.legend}>
        <span><i style={{ background: colors.fact.border }} />Initial Facts</span>
        <span><i style={{ background: colors.rule.border }} />Inference Rules</span>
        <span><i style={{ background: colors.conclusion.border }} />Conclusions</span>
      </div>

      <div style={styles.graph}>
        {nodes.length === 0 ? (
          <div style={styles.message}>No facts or rules are available in the knowledge base.</div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
            panOnDrag={[1, 2]}
            selectionOnDrag={false}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.2}
            maxZoom={2}
          >
            <Background color="#334155" gap={22} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                if (node.id.startsWith("fact-")) return colors.fact.border;
                if (node.id.startsWith("rule-")) return colors.rule.border;
                return colors.conclusion.border;
              }}
              maskColor="rgba(10, 15, 30, 0.7)"
            />
          </ReactFlow>
        )}
      </div>

      <p style={styles.hint}>
        Drag individual nodes to rearrange the graph. Use the mouse wheel to zoom and drag the empty canvas to move around.
      </p>
    </div>
  );
}

const styles = {
  container: { width: "100%", color: "#e2e8f0" },
  summary: { display: "flex", flexWrap: "wrap", gap: "14px", marginBottom: "18px" },
  stat: {
    display: "flex", alignItems: "center", gap: "9px",
    background: "#111c30", border: "1px solid #263750",
    borderRadius: "9px", padding: "11px 15px",
    fontSize: "13px", color: "#cbd5e1",
  },
  dot: { width: "9px", height: "9px", borderRadius: "50%" },
  legend: { display: "flex", flexWrap: "wrap", gap: "20px", marginBottom: "14px", fontSize: "12px", color: "#94a3b8" },
  graph: { width: "100%", height: "620px", background: "#0b1424", border: "1px solid #263750", borderRadius: "12px", overflow: "hidden" },
  hint: { color: "#94a3b8", fontSize: "12px", marginTop: "12px" },
  message: { padding: "35px", color: "#cbd5e1", background: "#111c30", borderRadius: "10px" },
  error: { padding: "22px", color: "#fecaca", background: "#3b1720", border: "1px solid #7f1d1d", borderRadius: "10px" },
  button: { padding: "9px 16px", background: "#2563eb", border: "none", borderRadius: "7px", color: "white", cursor: "pointer" },
};
