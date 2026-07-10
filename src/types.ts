export type QueryLanguage = 'prisma' | 'sql';

export type DbDialect = 'postgresql' | 'mysql' | 'sqlite';

export interface FieldDefinition {
  name: string;
  type: string;
  isId?: boolean;
  dbName?: string;
  isRelation?: boolean;
  relationModel?: string;
  relationFields?: string[];
  relationReferences?: string[];
}

export interface ModelDefinition {
  name: string;
  dbName?: string;
  fields: FieldDefinition[];
}

export interface QuerySchema {
  models: ModelDefinition[];
}

export interface ConversionRequest {
  code: string;
  fromLanguage: QueryLanguage;
  dialect: DbDialect;
  schema?: QuerySchema;
  enhanceWithAi?: boolean;
}

export interface AstNode {
  type: string;
  name?: string;
  value?: any;
  children?: AstNode[];
  properties?: Record<string, any>;
}

export interface IndexSuggestion {
  table: string;
  columns: string[];
  reason: string;
  sql: string;
}

export interface ConversionResponse {
  success: boolean;
  output: string;
  ast?: AstNode;
  explanation?: string;
  analysis?: {
    performanceScore: number;
    warnings: string[];
    indexSuggestions: IndexSuggestion[];
    complexityLevel: 'Low' | 'Medium' | 'High';
    queryPlanDescription?: string;
  };
  error?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  input: string;
  fromLanguage: QueryLanguage;
  output: string;
  dialect: DbDialect;
}
