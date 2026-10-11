export interface ClusterNode {
  id: string;
  title: string;
  category: string;
  x: number;
  y: number;
  z: number;
  summary?: string;
  imageUrl?: string;
  clusterId: number;
  neighbors: string[];
  vectorMagnitude?: number;
  dominantHex?: string;
  brightness?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

export interface GraphStats {
  totalNodes: number;
  totalEdges: number;
  avgDegree: number;
  density: number;
  featureDimensions: number;
}

export interface ClusterGraphResponse {
  nodes: ClusterNode[];
  edges: GraphEdge[];
  categories: string[];
  reductionMethod: 'tsne' | 'pca' | 'umap';
  totalPoints: number;
  stats: GraphStats;
}

export interface SearchResult {
  id: string;
  title: string;
  category: string;
  score: number;
  coordinates: [number, number, number];
  summary?: string;
}
