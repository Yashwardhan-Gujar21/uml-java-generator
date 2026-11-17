export type Visibility = 'public' | 'private' | 'protected' | 'package';
export type ClassType = 'class' | 'abstract' | 'interface' | 'enum';
export type RelationType = 'inheritance' | 'implementation' | 'association' | 'aggregation' | 'composition';

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