export interface BusinessQrCode {
  id: string;
  businessId: string;
  locationId: string | null;
  code: string;
  label: string | null;
  isActive: boolean;
  scanCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Public QR lookup — only the fields needed to resolve /q/<code>. */
export interface PublicBusinessQrCode {
  id: string;
  businessId: string;
  locationId: string | null;
  code: string;
  isActive: boolean;
}

export interface CreateQrCodeInput {
  businessId: string;
  locationId?: string | null;
  label?: string | null;
}

export interface UpdateQrCodeInput {
  label?: string | null;
  isActive?: boolean;
  locationId?: string | null;
}
