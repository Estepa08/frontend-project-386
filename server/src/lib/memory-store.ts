import crypto from "node:crypto";

type WhereOp<T> = { gte?: T; lte?: T; lt?: T; gt?: T };

const DEFAULTS: Record<string, Record<string, unknown>> = {
  meet: { status: "confirmed", createdAt: "__now__", updatedAt: "__now__" },
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

  private resolveId(where: Record<string, unknown>): string | number | undefined {
    if ("id" in where) return where.id as string | number;
    return undefined;
  }

  async findUnique(args: { where: Record<string, unknown> }): Promise<T | null> {
    const id = this.resolveId(args.where);
    if (id !== undefined) {
      return this.records.get(id) ?? null;
    }
    for (const record of this.records.values()) {
      if (matchWhere(record as unknown as Record<string, unknown>, args.where)) {
        return record;
      }
    }
    return null;
  }

  async findMany(args?: {
    where?: Record<string, unknown>;
    select?: Record<string, boolean>;
  }): Promise<T[]> {
    let result = [...this.records.values()];
    if (args?.where) {
      result = result.filter((r) => matchWhere(r as unknown as Record<string, unknown>, args.where!));
    }
    if (args?.select) {
      result = result.map((r) => pick(r as unknown as Record<string, unknown>, args.select!) as unknown as T);
    }
    return result;
  }

  async findFirst(args: { where: Record<string, unknown> }): Promise<T | null> {
    const results = await this.findMany({ where: args.where });
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

  async createMany(args: { data: Partial<T>[] }): Promise<{ count: number }> {
    for (const item of args.data) {
      await this.create({ data: item });
    }
    return { count: args.data.length };
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
}

interface Stores {
  workingHour: MemoryCollection<{ id: number; dayOfWeek: string; startTime: string; endTime: string }>;
  eventType: MemoryCollection<{ id: number; title: string; description: string; durationMinutes: number }>;
  meet: MemoryCollection<Record<string, unknown>>;
}

const stores: Stores = {
  workingHour: new MemoryCollection(true, "workingHour"),
  eventType: new MemoryCollection(true, "eventType"),
  meet: new MemoryCollection(true, "meet"),
};

const DEFAULT_WORKING_HOURS: Array<{ dayOfWeek: string; startTime: string; endTime: string }> =
  ["mon", "tue", "wed", "thu", "fri"].map((dayOfWeek) => ({
    dayOfWeek,
    startTime: "09:00",
    endTime: "18:00",
  }));

const DEFAULT_EVENT_TYPES: Array<{ title: string; description: string; durationMinutes: number }> = [
  { title: "Быстрая консультация", description: "Короткий звонок для уточнения вопросов", durationMinutes: 15 },
  { title: "Созвон", description: "Стандартная видео-встреча", durationMinutes: 30 },
];

async function seedDefaults(): Promise<void> {
  await stores.workingHour.createMany({ data: DEFAULT_WORKING_HOURS });
  await stores.eventType.createMany({ data: DEFAULT_EVENT_TYPES });
}

await seedDefaults();

export const memoryStore = {
  workingHour: stores.workingHour,
  eventType: stores.eventType,
  meet: stores.meet,
};
