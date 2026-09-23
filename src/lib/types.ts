export type Plano = 'free' | 'pro';
export type ApptStatus = 'pendente' | 'confirmado' | 'cancelado' | 'faltou' | 'concluido';

export type Business = {
  id: string;
  owner_id: string | null;
  slug: string;
  nome: string;
  whatsapp: string;
  plano: Plano;
  cor: string;
  logo_url: string;
  banner_url: string;
  ativo: boolean;
  categoria: string;
  descricao: string;
};

export const CATEGORIAS = [
  { id: 'beleza', label: 'Beleza (salão, barbearia, estética)' },
  { id: 'saude', label: 'Saúde (clínica, fisio, quiropraxia, odonto)' },
  { id: 'bemestar', label: 'Bem-estar (massagem, personal, yoga)' },
  { id: 'servicos', label: 'Serviços (tatuagem, consultoria, aulas)' },
  { id: 'automotivo', label: 'Automotivo / Casa (oficina, limpeza)' },
  { id: 'outros', label: 'Outros' },
] as const;

export type Service = {
  id: string;
  business_id: string;
  nome: string;
  duracao_min: number;
  preco: number;
  ativo: boolean;
};

export type Professional = {
  id: string;
  business_id: string;
  nome: string;
  ativo: boolean;
};

export type Availability = {
  id: string;
  professional_id: string;
  dia_semana: number; // 0=dom .. 6=sab
  inicio: string; // "08:00"
  fim: string; // "18:00"
};

export type AvailabilityException = {
  id: string;
  professional_id: string;
  data: string; // "2026-09-25"
  fechado: boolean;
  inicio: string | null;
  fim: string | null;
  motivo: string;
};

export type Appointment = {
  id: string;
  business_id: string;
  service_id: string;
  professional_id: string;
  client_profile_id: string | null;
  guest_nome: string;
  guest_whatsapp: string;
  inicio: string;
  fim: string;
  status: ApptStatus;
  token_publico: string;
};
