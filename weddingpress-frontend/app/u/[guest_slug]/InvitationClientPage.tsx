"use client";

import { InvitationData } from "@/types/models";
import { ModernTemplate } from "@/components/templates/ModernTemplate";
import { ClassicTemplate } from "@/components/templates/ClassicTemplate";
import { RusticTemplate } from "@/components/templates/RusticTemplate";
import { LuxuryTemplate } from "@/components/templates/LuxuryTemplate";

// Map string template ke Komponen
const TEMPLATES: Record<string, React.ComponentType<{ data: InvitationData }>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  rustic: RusticTemplate, // <-- Tambahkan ini
  luxury: LuxuryTemplate, // <-- Tambahkan ini
};

export function InvitationClientPage({ data }: { data: InvitationData }) {
  const { wedding } = data;

  // Ambil template dari database, default ke 'modern' jika null/tidak ditemukan
  const templateName = wedding.template || "modern";
  
  // Pilih komponen
  const SelectedTemplate = TEMPLATES[templateName] || ModernTemplate;

  return <SelectedTemplate data={data} />;
}