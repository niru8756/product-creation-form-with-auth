import fs from "fs";
import path from "path";

interface TaxonomyValue {
  id: string;
  name: string;
  handle: string;
}

interface TaxonomyAttribute {
  id: string;
  name: string;
  handle: string;
  description: string;
  extended: boolean;
  extended_attributes?: Array<{
    name: string;
    handle: string;
  }>;
  values?: TaxonomyValue[];
}

interface TaxonomyCategory {
  id: string;
  name: string;
  level?: number;
  full_name?: string;
  parent_id?: string;
  attributes?: TaxonomyAttribute[];
  children?: TaxonomyCategory[];
  ancestors?: Array<{
    id: string;
    name: string;
  }>;
}

class TaxonomyCache {
  private static instance: TaxonomyCache;
  private cache: Map<string, TaxonomyCategory> = new Map();
  private attributesCache: Map<string, TaxonomyAttribute> = new Map();
  private lastModified: number = 0;
  private filePath: string;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {
    this.filePath = path.resolve("prisma/data/taxonomy.json");
  }

  public static getInstance(): TaxonomyCache {
    if (!TaxonomyCache.instance) {
      TaxonomyCache.instance = new TaxonomyCache();
    }
    return TaxonomyCache.instance;
  }

  private async loadTaxonomyData(): Promise<any> {
    if (!fs.existsSync(this.filePath)) {
      throw new Error("Taxonomy file not found");
    }

    const stats = fs.statSync(this.filePath);
    const currentModified = stats.mtime.getTime();

    // Check if cache is still valid
    if (this.isInitialized && currentModified <= this.lastModified) {
      return null; // Cache is still valid
    }

    console.info("🔄 Loading taxonomy data from file...");
    const startTime = Date.now();

    const fileContent = fs.readFileSync(this.filePath, "utf8");
    const taxonomyData = JSON.parse(fileContent);

    this.lastModified = currentModified;
    this.isInitialized = true;

    console.info(`✅ Taxonomy data loaded in ${Date.now() - startTime}ms`);
    return taxonomyData;
  }

  private buildCategoryIndex(data: any): void {
    console.info("🔄 Building category index...");
    const startTime = Date.now();

    this.cache.clear();

    const indexCategories = (categories: any[]): void => {
      for (const category of categories) {
        if (category.id) {
          // Prefer the version with more properties (complete version over simplified)
          const existing = this.cache.get(category.id);
          if (
            !existing ||
            Object.keys(category).length > Object.keys(existing).length
          ) {
            this.cache.set(category.id, category);
          }
        }

        if (category.children && category.children.length > 0) {
          indexCategories(category.children);
        }
      }
    };

    // Process verticals structure
    if (data.verticals && Array.isArray(data.verticals)) {
      for (const vertical of data.verticals) {
        if (vertical.categories && Array.isArray(vertical.categories)) {
          indexCategories(vertical.categories);
        }
      }
    }

    console.info(`✅ Category index built in ${Date.now() - startTime}ms`);
    console.info(`📊 Indexed ${this.cache.size} categories`);
  }

  private buildAttributesIndex(data: any): void {
    console.info("🔄 Building attributes index...");
    const startTime = Date.now();

    this.attributesCache.clear();

    if (data.attributes && Array.isArray(data.attributes)) {
      for (const attribute of data.attributes) {
        if (attribute.id) {
          this.attributesCache.set(attribute.id, attribute);
        }
      }
    }

    console.info(`✅ Attributes index built in ${Date.now() - startTime}ms`);
    console.info(`📊 Indexed ${this.attributesCache.size} attributes`);
  }

  private enrichCategoryAttributes(
    category: TaxonomyCategory
  ): TaxonomyCategory {
    if (!category.attributes) {
      return category;
    }

    const enrichedAttributes = category.attributes.map((attr) => {
      const fullAttribute = this.attributesCache.get(attr.id);
      if (fullAttribute) {
        return {
          ...attr,
          values: fullAttribute.values || [],
        };
      }
      return attr;
    });

    return {
      ...category,
      attributes: enrichedAttributes,
    };
  }

  public async getCategory(
    categoryId: string
  ): Promise<TaxonomyCategory | null> {
    // Ensure cache is loaded
    await this.ensureCacheLoaded();

    const category = this.cache.get(categoryId);
    if (!category) {
      return null;
    }

    // Enrich category attributes with their values
    return this.enrichCategoryAttributes(category);
  }

  public async getAllCategories(): Promise<TaxonomyCategory[]> {
    // Ensure cache is loaded
    await this.ensureCacheLoaded();

    return Array.from(this.cache.values()).map((category) =>
      this.enrichCategoryAttributes(category)
    );
  }

  private async ensureCacheLoaded(): Promise<void> {
    // If already initializing, wait for that promise
    if (this.initializationPromise) {
      await this.initializationPromise;
      return;
    }

    // If already initialized, check if we need to reload
    if (this.isInitialized) {
      const taxonomyData = await this.loadTaxonomyData();
      if (taxonomyData) {
        this.buildCategoryIndex(taxonomyData);
        this.buildAttributesIndex(taxonomyData);
      }
      return;
    }

    // Start initialization
    this.initializationPromise = this.performInitialization();
    await this.initializationPromise;
    this.initializationPromise = null;
  }

  private async performInitialization(): Promise<void> {
    try {
      const taxonomyData = await this.loadTaxonomyData();
      if (taxonomyData) {
        this.buildCategoryIndex(taxonomyData);
        this.buildAttributesIndex(taxonomyData);
      }
    } catch (error) {
      console.error("❌ Failed to initialize taxonomy cache:", error);
      throw error;
    }
  }

  public async searchCategories(
    query: string,
    limit: number = 50
  ): Promise<TaxonomyCategory[]> {
    await this.ensureCacheLoaded();

    const results: TaxonomyCategory[] = [];
    const lowerQuery = query.toLowerCase().trim();

    // If query is empty, return all categories
    if (!lowerQuery) {
      return Array.from(this.cache.values())
        .map((category) => this.enrichCategoryAttributes(category))
        .slice(0, limit);
    }

    for (const category of this.cache.values()) {
      // Search in multiple fields
      const matchesName = category.name.toLowerCase().includes(lowerQuery);
      const matchesFullName =
        category.full_name &&
        category.full_name.toLowerCase().includes(lowerQuery);
      const matchesId = category.id.toLowerCase().includes(lowerQuery);

      if (matchesName || matchesFullName || matchesId) {
        results.push(this.enrichCategoryAttributes(category));

        if (results.length >= limit) {
          break;
        }
      }
    }

    // Sort results by relevance (exact matches first, then partial matches)
    results.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aFullName = a.full_name?.toLowerCase() || "";
      const bFullName = b.full_name?.toLowerCase() || "";

      // Exact matches get priority
      const aExactMatch = aName === lowerQuery || aFullName === lowerQuery;
      const bExactMatch = bName === lowerQuery || bFullName === lowerQuery;

      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;

      // Then sort by name length (shorter names first)
      return aName.length - bName.length;
    });

    return results;
  }

  public getCacheStats(): {
    size: number;
    attributesSize: number;
    lastModified: number;
    isInitialized: boolean;
  } {
    return {
      size: this.cache.size,
      attributesSize: this.attributesCache.size,
      lastModified: this.lastModified,
      isInitialized: this.isInitialized,
    };
  }

  // Method to preload cache (useful for startup optimization)
  public async preload(): Promise<void> {
    console.info("🚀 Preloading taxonomy cache...");
    await this.ensureCacheLoaded();
    console.info("✅ Taxonomy cache preloaded");
  }
}

export default TaxonomyCache;
