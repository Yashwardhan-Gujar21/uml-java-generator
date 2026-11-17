import { Handle, Position } from '@xyflow/react';

export type Visibility = 'public' | 'private' | 'protected' | 'package';
export type ClassType = 'class' | 'abstract' | 'interface' | 'enum';

export interface UmlAttribute {
  id: string;
  visibility: Visibility;
  name: string;
  type: string;
  isStatic?: boolean;
}

export interface UmlParameter {
  name: string;
  type: string;
}

export interface UmlMethod {
  id: string;
  visibility: Visibility;
  name: string;
  returnType: string;
  parameters: UmlParameter[];
  isAbstract?: boolean;
  isStatic?: boolean;
}

export interface UmlClassData {
  className: string;
  classType: ClassType;
  packageName: string;
  attributes: UmlAttribute[];
  methods: UmlMethod[];
}

const visSymbol: Record<Visibility, string> = {
  public: '+',
  private: '-',
  protected: '#',
  package: '~',
};

export function UmlClassNode({ data, selected }: { data: UmlClassData; selected?: boolean }) {
  const { className, classType, attributes, methods } = data;

  return (
    <div className={`min-w-[220px] rounded border-2 bg-white shadow-md font-mono text-xs ${
      selected ? 'border-blue-600' : 'border-slate-800'
    }`} style={{ background: '#ffffff', color: '#0f172a', padding: 0, borderRadius: '6px' }}>
      {/* 4-way connection handles */}
      <Handle type="target" position={Position.Top} style={{ background: '#3b82f6', width: '10px', height: '10px' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#3b82f6', width: '10px', height: '10px' }} />
      <Handle type="target" position={Position.Left} id="left" style={{ background: '#3b82f6', width: '10px', height: '10px' }} />
      <Handle type="source" position={Position.Right} id="right" style={{ background: '#3b82f6', width: '10px', height: '10px' }} />

      {/* Compartment 1: Header */}
      <div style={{ borderBottom: '2px solid #1e293b', background: '#f1f5f9', padding: '8px 12px', textAlign: 'center', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}>
        {classType !== 'class' && (
          <div style={{ fontSize: '10px', color: '#64748b' }}>&laquo;{classType}&raquo;</div>
        )}
        <div style={{ fontWeight: 'bold', fontSize: '14px', fontStyle: classType === 'abstract' ? 'italic' : 'normal' }}>
          {className}
        </div>
      </div>

      {/* Compartment 2: Attributes */}
      <div style={{ borderBottom: '1px solid #cbd5e1', padding: '8px 12px', minHeight: '28px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {attributes && attributes.map((attr) => (
          <div key={attr.id} style={{ textDecoration: attr.isStatic ? 'underline' : 'none' }}>
            {visSymbol[attr.visibility]} {attr.name}: {attr.type}
          </div>
        ))}
      </div>

      {/* Compartment 3: Methods */}
      <div style={{ padding: '8px 12px', minHeight: '28px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {methods && methods.map((m) => {
          const params = m.parameters ? m.parameters.map((p) => `${p.name}: ${p.type}`).join(', ') : '';
          return (
            <div key={m.id} style={{ fontStyle: m.isAbstract ? 'italic' : 'normal', textDecoration: m.isStatic ? 'underline' : 'none' }}>
              {visSymbol[m.visibility]} {m.name}({params}): {m.returnType}
            </div>
          );
        })}
      </div>
    </div>
  );
}