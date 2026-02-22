// app/api/tryon/status/route.ts
// Endpoint de polling - verificar status do job

import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId necessário" },
        { status: 400 }
      );
    }

    const job = getJob(jobId);

    if (!job) {
      console.warn(`⚠️ Job ${jobId} não encontrado`);
      return NextResponse.json(
        { error: "Job não encontrado" },
        { status: 404 }
      );
    }

    console.log(`📊 Status do job ${jobId}: ${job.status}`);

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      imageUrl: job.imageUrl || null,
      error: job.error || null,
    });
  } catch (err) {
    console.error("❌ Erro em GET /api/tryon/status:", err);
    return NextResponse.json(
      { error: "Erro ao verificar status" },
      { status: 500 }
    );
  }
}
