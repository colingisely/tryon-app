// lib/storage.ts
// Armazenamento de jobs em memória (para POC)
// Em produção, usar banco de dados

export interface Job {
  id: string;
  status: "pending" | "processing" | "succeeded" | "failed";
  imageUrl?: string;
  error?: string;
  createdAt: Date;
}

const jobs: Map<string, Job> = new Map();

export function createJob(): string {
  const id = Math.random().toString(36).substring(7).toUpperCase();
  console.log(`✅ Job criado: ${id}`);

  jobs.set(id, {
    id,
    status: "pending",
    createdAt: new Date(),
  });

  return id;
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function updateJob(id: string, update: Partial<Job>): void {
  const job = jobs.get(id);
  if (job) {
    const updated = { ...job, ...update };
    jobs.set(id, updated);
    console.log(`📝 Job ${id} atualizado:`, updated.status);
  }
}
