export type ServiceType =
  | "recolha_moveis"
  | "recolha_monos"
  | "recolha_entulho"
  | "esvaziamento_casa"
  | "esvaziamento_apartamento"
  | "mudanca"
  | "outro";

export type LocationZone = "A" | "B" | "C" | "D";

export interface UploadedFile {
  id: string;
  file?: File;
  previewUrl?: string;
  type?: "image" | "video";
  name: string;
  size: number;
  mimeType?: string;
  base64?: string;
}

export interface AddressData {
  formattedAddress?: string;
  city?: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
}

export type AddressStatus = "empty" | "typing" | "selected" | "manual_confirmed";
export type DistanceStatus = "idle" | "calculating" | "calculated" | "error";

export interface DistanceFromBase {
  distanceMeters?: number;
  distanceKm?: number;
  durationSeconds?: number;
  durationText?: string;
  calculatedAt?: string;
  isEstimate?: boolean; // true quando calculado por Haversine (sem Google Maps)
}

export interface ReceiverData {
  name?: string;
  phone?: string;
  email?: string;
}

// ── Mudança: condições de acesso por local ──────────────────────────────────
export interface MovingAccess {
  floor?: string;
  hasElevator?: "yes" | "small" | "no" | "unknown";
  parkingDistance?: "door" | "under_20m" | "over_30m" | "difficult" | "unknown";
  difficultAccess?: boolean;
  accessNotes?: string;
}

// ── Mudança: distância origem → destino ──────────────────────────────────────
export interface MovingDistance {
  distanceMeters?: number;
  distanceKm?: number;
  durationSeconds?: number;
  durationText?: string;
  calculatedAt?: string;
  isEstimate?: boolean;
}

export interface OrderData {
  serviceType?: ServiceType;
  description?: string;
  files?: UploadedFile[];
  locationZone?: LocationZone;
  city?: string;
  address?: AddressData;
  addressStatus?: AddressStatus;
  distanceFromBase?: DistanceFromBase;
  distanceStatus?: DistanceStatus;
  floor?: string;
  hasElevator?: "yes" | "small" | "no" | "unknown";
  parkingDistance?: "door" | "under_20m" | "over_30m" | "difficult" | "unknown";
  needsDismantling?: "no" | "simple" | "medium" | "complex" | "unknown";
  heavyItems?: string[];
  urgency?: "no" | "today" | "tomorrow" | "this_week" | "flexible";
  receiver?: ReceiverData;
  // Campos específicos para entulho
  entulhoState?: "ensacado" | "chao" | "misto" | "unknown";
  entulhoQuantidade?: string;
  // Campos específicos para mudança (dois endereços)
  originAddress?: AddressData;
  originAddressValue?: string;
  originAddressStatus?: AddressStatus;
  destinationAddress?: AddressData;
  destinationAddressValue?: string;
  destinationAddressStatus?: AddressStatus;
  originAccess?: MovingAccess;
  destinationAccess?: MovingAccess;
  movingDistance?: MovingDistance;
  movingDistanceStatus?: DistanceStatus;
}

export type EstimateStatus = "estimated" | "needs_more_info" | "onsite_required";
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface EstimateResult {
  status: EstimateStatus;
  estimatedPriceWithoutVat: number | null;
  vatAmount: number | null;
  estimatedPriceWithVat: number | null;
  difficultyLevel: DifficultyLevel;
  summary: string;
  assumptions: string[];
  missingFields: string[];
  customerMessage: string;
  internalNotes: string[];
}

export type ChatMessageRole = "assistant" | "user";

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  timestamp: Date;
  quickReplies?: string[];
  showContactForm?: boolean;
  showAddressField?: boolean;
  showUpload?: boolean;
  files?: UploadedFile[];
}

export type ChatStep =
  | "service_type"
  | "description"
  | "files"
  | "city"
  | "address"
  | "floor"
  | "elevator"
  | "parking"
  | "dismantling"
  | "heavy_items"
  | "urgency"
  | "receiver"
  | "complete";
