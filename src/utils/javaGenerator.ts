export interface UmlAttribute {
  id: string;
  visibility: 'public' | 'private' | 'protected' | 'package';
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
  visibility: 'public' | 'private' | 'protected' | 'package';
  name: string;
  returnType: string;
  parameters: UmlParameter[];
  isAbstract?: boolean;
  isStatic?: boolean;
}

export interface UmlClassData {
  className: string;
  classType: 'class' | 'abstract' | 'interface' | 'enum';
  packageName: string;
  attributes: UmlAttribute[];
  methods: UmlMethod[];
}

export function generateJavaProject(nodes: any[], edges: any[]): Record<string, string> {
  const files: Record<string, string> = {};

  nodes.forEach((node) => {
    const data: UmlClassData = node.data;
    if (!data || !data.className) return;

    const packageName = data.packageName || 'com.example.model';
    const className = data.className;
    const classType = data.classType || 'class';

    // Find outgoing relationships for this node to generate inheritance/interfaces/fields
    const outgoingEdges = edges.filter((e) => e.source === node.id);
    const inherits = outgoingEdges
      .filter((e) => e.data?.relationType === 'inheritance')
      .map((e) => nodes.find((n) => n.id === e.target)?.data?.className)
      .filter(Boolean);

    const implementsInterfaces = outgoingEdges
      .filter((e) => e.data?.relationType === 'implementation')
      .map((e) => nodes.find((n) => n.id === e.target)?.data?.className)
      .filter(Boolean);

    // Association / Composition fields
    const associationFields = outgoingEdges
      .filter((e) => ['association', 'aggregation', 'composition'].includes(e.data?.relationType))
      .map((e) => {
        const targetNode = nodes.find((n) => n.id === e.target);
        if (!targetNode) return null;
        const targetName = targetNode.data.className;
        const fieldName = targetName.charAt(0).toLowerCase() + targetName.slice(1);
        return `    private ${targetName} ${fieldName};`;
      })
      .filter(Boolean);

    let code = `package ${packageName};\n\n`;

    // Imports if needed
    code += `import java.util.*;\n\n`;

    // Class declaration header
    let declaration = `public `;
    if (classType === 'abstract') declaration += `abstract class `;
    else if (classType === 'interface') declaration += `interface `;
    else if (classType === 'enum') declaration += `enum `;
    else declaration += `class `;

    declaration += `${className}`;

    if (inherits.length > 0 && classType !== 'interface') {
      declaration += ` extends ${inherits.join(', ')}`;
    }

    if (implementsInterfaces.length > 0) {
      declaration += ` implements ${implementsInterfaces.join(', ')}`;
    }

    code += `${declaration} {\n\n`;

    // Attributes
    if (data.attributes && data.attributes.length > 0) {
      data.attributes.forEach((attr) => {
        const vis = attr.visibility === 'package' ? '' : attr.visibility;
        const stat = attr.isStatic ? ' static' : '';
        code += `    ${vis}${stat} ${attr.type} ${attr.name};\n`;
      });
      code += `\n`;
    }

    // Relationship fields
    if (associationFields.length > 0) {
      code += associationFields.join('\n') + `\n\n`;
    }

    // Constructors (for regular / abstract classes)
    if (classType !== 'interface' && classType !== 'enum') {
      code += `    public ${className}() {\n`;
      code += `    }\n\n`;
    }

    // Methods
    if (data.methods && data.methods.length > 0) {
      data.methods.forEach((m) => {
        const vis = m.visibility === 'package' ? '' : m.visibility;
        const stat = m.isStatic ? ' static' : '';
        const abstr = m.isAbstract ? ' abstract' : '';
        const params = m.parameters ? m.parameters.map((p) => `${p.type} ${p.name}`).join(', ') : '';

        if (classType === 'interface' || m.isAbstract) {
          code += `    ${vis}${stat}${abstr} ${m.returnType} ${m.name}(${params});\n`;
        } else {
          code += `    ${vis}${stat} ${m.returnType} ${m.name}(${params}) {\n`;
          code += `        // TODO: implement method\n`;
          if (m.returnType !== 'void') {
            code += `        return null;\n`;
          }
          code += `    }\n\n`;
        }
      });
    }

    code += `}\n`;

    const fileName = `${packageName.replace(/\./g, '/')}/${className}.java`;
    files[fileName] = code;
  });

  return files;
}