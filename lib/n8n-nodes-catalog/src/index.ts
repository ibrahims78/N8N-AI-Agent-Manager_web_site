import catalogData from "../data/catalog.json" with { type: "json" };

export interface CatalogExample {
  label: string;
  url: string;
  icon: string;
}

export interface CatalogNode {
  nodeType: string;
  displayName: string;
  fileName: string;
  folder: string;
  isTrigger: boolean;
  nodeVersion: string;
  codexVersion: string;
  categories: string[];
  subcategories: Record<string, string[]>;
  aliases: string[];
  credentialDocsUrl: string | null;
  primaryDocsUrl: string | null;
  examples: CatalogExample[];
  iconUrl: string;
  sourcePath: string;
}

export interface CatalogFile {
  version: number;
  fetchedAt: string;
  source: string;
  branch: string;
  count: number;
  nodes: CatalogNode[];
}

export const catalog = catalogData as CatalogFile;

export function getCatalogNodes(): CatalogNode[] {
  return catalog.nodes;
}

export function findCatalogNode(nodeType: string): CatalogNode | undefined {
  const lower = nodeType.toLowerCase();
  return catalog.nodes.find(
    (n) => n.nodeType.toLowerCase() === lower || n.folder.toLowerCase() === lower
  );
}

export function searchCatalog(query: string): CatalogNode[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return catalog.nodes.filter((n) => {
    if (n.nodeType.toLowerCase().includes(q)) return true;
    if (n.displayName.toLowerCase().includes(q)) return true;
    if (n.folder.toLowerCase().includes(q)) return true;
    if (n.aliases.some((a) => a.toLowerCase().includes(q))) return true;
    if (n.categories.some((c) => c.toLowerCase().includes(q))) return true;
    return false;
  });
}

export function getCategories(): string[] {
  const set = new Set<string>();
  catalog.nodes.forEach((n) => n.categories.forEach((c) => set.add(c)));
  return [...set].sort();
}
