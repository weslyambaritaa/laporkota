import { GoogleGenAI } from "@google/genai";
import type { ClassifyResult, ReportCategory, ReportUrgency } from "./types";

const MODEL = "gemini-2.5-flash";

const VALID_CATEGORIES: ReportCategory[] = [
  "jalan",
  "sampah",
  "penerangan",
  "drainase",
  "fasilitas_umum",
  "lainnya",
];

const VALID_URGENCY: ReportUrgency[] = ["rendah", "sedang", "tinggi"];

const PROMPT = `Kamu adalah asisten yang membantu mengklasifikasikan laporan warga tentang masalah infrastruktur atau lingkungan di sekitar tempat tinggal mereka.

Berdasarkan judul, deskripsi, dan foto (jika ada) yang diberikan, tentukan:
1. "category": salah satu dari ["jalan", "sampah", "penerangan", "drainase", "fasilitas_umum", "lainnya"]
2. "urgency": salah satu dari ["rendah", "sedang", "tinggi"] berdasarkan seberapa berbahaya/mengganggu masalah tersebut bagi keselamatan dan aktivitas warga
3. "reasoning": alasan singkat (maksimal 2 kalimat, Bahasa Indonesia) mengapa kamu memilih kategori dan urgensi tersebut

Balas HANYA dengan JSON valid tanpa markdown, format:
{"category": "...", "urgency": "...", "reasoning": "..."}`;

export async function classifyReport(params: {
  title: string;
  description: string;
  photoBase64?: string;
  photoMimeType?: string;
}): Promise<ClassifyResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY belum diatur di environment variables");
  }

  const ai = new GoogleGenAI({ apiKey });

  const parts: (
    | { text: string }
    | { inlineData: { data: string; mimeType: string } }
  )[] = [
    {
      text: `${PROMPT}\n\nJudul: ${params.title}\nDeskripsi: ${params.description}`,
    },
  ];

  if (params.photoBase64 && params.photoMimeType) {
    parts.push({
      inlineData: {
        data: params.photoBase64,
        mimeType: params.photoMimeType,
      },
    });
  }

  const result = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts }],
  });
  const text = (result.text ?? "").trim();
  const jsonText = text.replace(/^```json\s*|\s*```$/g, "").trim();

  let parsed: Partial<ClassifyResult>;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("Gagal membaca respons AI, coba lagi.");
  }

  const category = VALID_CATEGORIES.includes(parsed.category as ReportCategory)
    ? (parsed.category as ReportCategory)
    : "lainnya";
  const urgency = VALID_URGENCY.includes(parsed.urgency as ReportUrgency)
    ? (parsed.urgency as ReportUrgency)
    : "sedang";

  return {
    category,
    urgency,
    reasoning: parsed.reasoning?.toString().slice(0, 500) ?? "",
  };
}
