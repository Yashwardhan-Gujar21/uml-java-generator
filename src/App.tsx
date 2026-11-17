import { useState, useMemo, useCallback } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { UmlClassNode } from './components/UmlClassNode';
import { generateJavaProject } from './utils/javaGenerator';
import { RelationType } from './types/uml';

const nodeTypes = { umlClass: UmlClassNode };

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [selectedRelation, setSelectedRelation] = useState<RelationType>('association');

  const onConnect = useCallback((params: any) => {
    const newEdge = { ...params, data: { relationType: selectedRelation } };
    setEdges((eds) => addEdge(newEdge, eds));
  }, [selectedRelation, setEdges]);

  const addClassNode = () => {
    const id = `node_${Date.now()}`;
    const newNode = {
      id,
      type: 'umlClass',
      position: { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50 },
      data: {
        className: `NewClass${nodes.length + 1}`,
        classType: 'class',
        packageName: 'com.example.model',
        attributes: [{ id: 'attr_1', visibility: 'private', name: 'id', type: 'Long' }],
        methods: [{ id: 'meth_1', visibility: 'public', name: 'getId', returnType: 'Long', parameters: [] }],
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const generatedFiles = useMemo(() => generateJavaProject(nodes, edges), [nodes, edges]);

  const exportZip = async () => {
    const zip = new JSZip();
    for (const [filename, content] of Object.entries(generatedFiles)) {
      zip.file(filename, content);
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'uml-generated-java-sources.zip');
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a', color: '#f8fafc', overflow: 'hidden' }}>
      {/* Top Toolbar */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155', background: '#1e293b', padding: '12px 24px', height: '60px' }}>
        <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>UML Class Diagram & Java Code Generator</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={addClassNode} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
            + Add Class
          </button>
          <select 
            value={selectedRelation} 
            onChange={(e) => setSelectedRelation(e.target.value as RelationType)}
            style={{ background: '#334155', color: 'white', border: '1px solid #475569', padding: '8px', borderRadius: '4px' }}
          >
            <option value="association">Association</option>
            <option value="inheritance">Inheritance (extends)</option>
            <option value="implementation">Implementation (implements)</option>
            <option value="aggregation">Aggregation</option>
            <option value="composition">Composition</option>
          </select>
          <button onClick={exportZip} style={{ background: '#059669', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
            Export Java ZIP
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div style={{ display: 'flex', flex: 1, width: '100%', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
        <div style={{ flex: 1, height: '100%', position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background color="#334155" gap={20} />
            <Controls />
            <MiniMap style={{ background: '#1e293b' }} />
          </ReactFlow>
        </div>

        {/* Live Code Preview Sidebar */}
        <aside style={{ width: '420px', borderLeft: '1px solid #334155', background: '#020617', padding: '16px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginTop: 0, marginBottom: '12px' }}>Live Java Source Preview</h2>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'monospace', fontSize: '12px' }}>
            {Object.keys(generatedFiles).length === 0 ? (
              <p style={{ color: '#64748b', fontStyle: 'italic' }}>Add classes on the canvas to generate Java source code...</p>
            ) : (
              Object.entries(generatedFiles).map(([filename, code]) => (
                <div key={filename} style={{ border: '1px solid #1e293b', background: '#0f172a', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                  <div style={{ background: '#1e293b', padding: '8px 12px', fontWeight: 'bold', color: '#cbd5e1', borderBottom: '1px solid #334155' }}>
                    <span>{filename}</span>
                  </div>
                  <pre style={{ padding: '12px', color: '#34d399', overflowX: 'auto', margin: 0, whiteSpace: 'pre-wrap' }}>{code}</pre>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}