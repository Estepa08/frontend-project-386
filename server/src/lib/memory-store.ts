import crypto from "node:crypto";

type WhereOp<T> = { gte?: T; lte?: T; lt?: T; gt?: T };

const DEFAULTS: Record<string, Record<string, unknown>> = {
  meet: { status: "confirmed", createdAt: "__now__", updatedAt: "__now__" },
  admin: { createdAt: "__now__" },
  user: { createdAt: "__now__" },
  meetingType: { visible: true, allowGuestInvite: false },
};

function toTs(v: unknown): number {
  if (v instanceof Date) return v.getTime();
  if (typeof v === "string") {
    const ts = Date.parse(v);
    if (!isNaN(ts)) return ts;
  }
  return v as number;
}

function matchWhere(record: Record<string, unknown>, where: Record<string, unknown>): boolean {
  for (const [key, value] of Object.entries(where)) {
    const fieldValue = record[key];
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      const ops = value as WhereOp<unknown>;
      if (ops.gte !== undefined && toTs(fieldValue) < toTs(ops.gte)) return false;
      if (ops.lte !== undefined && toTs(fieldValue) > toTs(ops.lte)) return false;
      if (ops.lt !== undefined && toTs(fieldValue) >= toTs(ops.lt)) return false;
      if (ops.gt !== undefined && toTs(fieldValue) <= toTs(ops.gt)) return false;
    } else if (fieldValue !== value) {
      return false;
    }
  }
  return true;
}

function pick<T extends Record<string, unknown>>(obj: T, select: Record<string, boolean>): Partial<T> {
  const result: Partial<T> = {};
  for (const key of Object.keys(select)) {
    if (key in obj) result[key as keyof T] = obj[key] as T[keyof T];
  }
  return result;
}

class MemoryCollection<T extends Record<string, unknown>> {
  private records = new Map<string | number, T>();
  private nextId = 1;
  private isAutoId: boolean;
  private modelName: string;

  constructor(isAutoId: boolean, modelName = "") {
    this.isAutoId = isAutoId;
    this.modelName = modelName;
  }

  insert(id: string | number, record: T) {
    this.records.set(id, record);
    if (this.isAutoId && typeof id === "number" && id >= this.nextId) {
      this.nextId = id + 1;
    }
  }

  private resolveId(where: Record<string, unknown>): string | number | undefined {
    if ("id" in where) return where.id as string | number;
    return undefined;
  }

  async findUnique( args: { where: Record<string, unknown>; include?: Record<string, unknown> } ): Promise<T | null> {
    const id = this.resolveId(args.where);
    let record: T | undefined;
    if (id !== undefined) {
      record = this.records.get(id);
    } else {
      for (const r of this.records.values()) {
        if (matchWhere(r as unknown as Record<string, unknown>, args.where)) {
          record = r;
          break;
        }
      }
    }
    if (!record) return null;
    if (args.include) {
      return this.applyInclude(record, args.include);
    }
    return record;
  }

  async findMany(args?: { where?: Record<string, unknown>; include?: Record<string, unknown>; select?: Record<string, boolean> }): Promise<T[]> {
    let result = [...this.records.values()];
    if (args?.where) {
      result = result.filter((r) => matchWhere(r as unknown as Record<string, unknown>, args.where!));
    }
    if (args?.include) {
      result = result.map((r) => this.applyInclude(r, args.include!));
    } else if (args?.select) {
      result = result.map((r) => pick(r as unknown as Record<string, unknown>, args.select!) as unknown as T);
    }
    return result;
  }

  async findFirst(args: { where: Record<string, unknown>; include?: Record<string, unknown> }): Promise<T | null> {
    const results = await this.findMany({ where: args.where, include: args.include });
    return results[0] ?? null;
  }

  async create(args: { data: Partial<T> & { id?: string | number } }): Promise<T> {
    const id = args.data.id ?? (this.isAutoId ? this.nextId++ : crypto.randomUUID());
    const modelDefaults = DEFAULTS[this.modelName] ?? {};
    const dataWithDefaults = { ...args.data } as Record<string, unknown>;
    for (const [key, value] of Object.entries(modelDefaults)) {
      if (dataWithDefaults[key] === undefined) {
        dataWithDefaults[key] = value === "__now__" ? new Date() : value;
      }
    }
    const record = { ...dataWithDefaults, id } as unknown as T;
    this.records.set(id, record);
    return record;
  }

  async update(args: { where: { id: string | number }; data: Partial<T> }): Promise<T> {
    const existing = this.records.get(args.where.id);
    if (!existing) throw new Error("Record not found");
    const data = { ...args.data } as Record<string, unknown>;
    if ("updatedAt" in (existing as Record<string, unknown>)) {
      data.updatedAt = new Date();
    }
    const updated = { ...existing, ...data };
    this.records.set(args.where.id, updated);
    return updated;
  }

  async delete(args: { where: { id: string | number } }): Promise<T> {
    const existing = this.records.get(args.where.id);
    if (!existing) throw new Error("Record not found");
    this.records.delete(args.where.id);
    return existing;
  }

  async deleteMany(args: { where: Record<string, unknown> }): Promise<{ count: number }> {
    let count = 0;
    for (const [id, record] of this.records) {
      if (matchWhere(record as unknown as Record<string, unknown>, args.where)) {
        this.records.delete(id);
        count++;
      }
    }
    return { count };
  }

  async createMany(args: { data: Partial<T>[] }): Promise<{ count: number }> {
    for (const item of args.data) {
      await this.create({ data: item });
    }
    return { count: args.data.length };
  }

  private applyInclude(record: T, include: Record<string, unknown>): T {
    const result = { ...record } as Record<string, unknown>;
    for (const [relation, spec] of Object.entries(include)) {
      const selectSpec = (spec as Record<string, unknown>).select as Record<string, boolean> | undefined;
      if (relation === "user" && (result as any).userId) {
        const user = stores.user.records.get((result as any).userId);
        result.user = user ? (selectSpec ? pick(user, selectSpec) : user) : null;
      } else if (relation === "admin" && (result as any).adminId) {
        const admin = stores.admin.records.get((result as any).adminId);
        result.admin = admin ? (selectSpec ? pick(admin, selectSpec) : admin) : null;
      }
    }
    return result as T;
  }
}

interface Stores {
  admin: MemoryCollection<{ id: string; name: string; email: string; password: string; createdAt: Date }>;
  user: MemoryCollection<{ id: string; name: string; email: string; password: string; createdAt: Date }>;
  workingHour: MemoryCollection<{ id: number; adminId: string; dayOfWeek: string; startTime: string; endTime: string }>;
  meetingType: MemoryCollection<{ id: number; adminId: string; duration: number; category: string; visible: boolean; allowGuestInvite: boolean }>;
  meet: MemoryCollection<Record<string, unknown>>;
}

const stores: Stores = {
  admin: new MemoryCollection(false, "admin"),
  user: new MemoryCollection(false, "user"),
  workingHour: new MemoryCollection(true, "workingHour"),
  meetingType: new MemoryCollection(true, "meetingType"),
  meet: new MemoryCollection(true, "meet"),
};

function seed() {
  const now = new Date();
  const adminPassword = "$2b$10$o0K88ITGLLI6GNEYWnsw3ef.FccxRRYNb5Ke/2bq4p7xI4qwjWyGK";
  const userPassword = "$2b$10$o0K88ITGLLI6GNEYWnsw3ef.FccxRRYNb5Ke/2bq4p7xI4qwjWyGK";

  stores.admin.insert("1", { id: "1", name: "Admin", email: "admin@meetly.app", password: adminPassword, createdAt: now });
  stores.user.insert("2", { id: "2", name: "User", email: "user@meetly.app", password: userPassword, createdAt: now });
}

seed();

export const memoryStore = {
  admin: stores.admin,
  user: stores.user,
  workingHour: stores.workingHour,
  meetingType: stores.meetingType,
  meet: stores.meet,
};
