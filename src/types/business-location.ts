export interface BusinessLocation {
  id: string;
  businessId: string;
  name: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string | null;
  country: string;
  phone: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessLocationInput {
  businessId: string;
  name?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode?: string | null;
  country?: string;
  phone?: string | null;
  isPrimary?: boolean;
}

export interface UpdateBusinessLocationInput {
  name?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string;
  state?: string;
  postalCode?: string | null;
  country?: string;
  phone?: string | null;
  isPrimary?: boolean;
}
