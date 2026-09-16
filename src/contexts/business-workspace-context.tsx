import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { businessService } from "@/services/businesses";
import { qrCodeService } from "@/services/qr";
import { isFailure } from "@/types";
import type {
  Business,
  BusinessCategory,
  BusinessLocation,
  BusinessQrCode,
} from "@/types";
import {
  readStoredBusinessId,
  storeBusinessId,
} from "@/lib/business/current-business-storage";

interface BusinessWorkspaceValue {
  businesses: Business[];
  currentBusiness: Business | null;
  categories: BusinessCategory[];
  locations: BusinessLocation[];
  qrCodes: BusinessQrCode[];
  loading: boolean;
  qrLoading: boolean;
  qrReady: boolean;
  error: string | null;
  setCurrentBusinessId: (id: string) => void;
  refresh: () => Promise<void>;
  loadQrCodes: (businessId: string) => Promise<void>;
}

const BusinessWorkspaceContext = createContext<BusinessWorkspaceValue | null>(
  null,
);

export function BusinessWorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(readStoredBusinessId());
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [locations, setLocations] = useState<BusinessLocation[]>([]);
  const [qrCodes, setQrCodes] = useState<BusinessQrCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrLoadedFor, setQrLoadedFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentIdRef = useRef(currentId);
  const detailsFetchRef = useRef(0);
  const qrFetchRef = useRef(0);
  currentIdRef.current = currentId;

  const loadDetails = useCallback(async (businessId: string) => {
    const fetchId = ++detailsFetchRef.current;
    const [locationResult, businessResult] = await Promise.all([
      businessService.getLocations(businessId),
      businessService.getBusiness(businessId),
    ]);

    if (fetchId !== detailsFetchRef.current) {
      return;
    }

    setLocations(isFailure(locationResult) ? [] : locationResult.data);
    if (!isFailure(businessResult)) {
      setBusinesses((current) =>
        current.map((item) =>
          item.id === businessResult.data.id ? businessResult.data : item,
        ),
      );
    }
  }, []);

  const loadQrCodes = useCallback(async (businessId: string) => {
    const fetchId = ++qrFetchRef.current;
    setQrLoading(true);
    const qrResult = await qrCodeService.getQrCodes(businessId);
    if (fetchId !== qrFetchRef.current || businessId !== currentIdRef.current) {
      return;
    }
    setQrCodes(isFailure(qrResult) ? [] : qrResult.data);
    setQrLoadedFor(businessId);
    setQrLoading(false);
  }, []);

  const load = useCallback(async (options?: { showLoading?: boolean }) => {
    if (options?.showLoading) {
      setLoading(true);
    }
    setError(null);

    const [businessResult, categoryResult] = await Promise.all([
      businessService.getMyBusinesses(),
      businessService.getCategories(),
    ]);

    if (isFailure(businessResult)) {
      setError(businessResult.error.message);
      setLoading(false);
      return;
    }

    if (!isFailure(categoryResult)) {
      setCategories(categoryResult.data);
    }

    const list = businessResult.data;
    setBusinesses(list);

    const stored = readStoredBusinessId();
    const selected =
      list.find((item) => item.id === stored)?.id ??
      list.find((item) => item.id === currentIdRef.current)?.id ??
      list[0]?.id ??
      null;

    setCurrentId(selected);
    if (selected) {
      storeBusinessId(selected);
      await loadDetails(selected);
    } else {
      setLocations([]);
      setQrCodes([]);
    }
    setLoading(false);
  }, [loadDetails]);

  useEffect(() => {
    void load({ showLoading: true });
  }, [load]);

  const refresh = useCallback(async () => {
    const selected = currentIdRef.current;
    if (!selected) {
      await load();
      return;
    }
    await loadDetails(selected);
  }, [load, loadDetails]);

  const currentBusiness =
    businesses.find((item) => item.id === currentId) ?? businesses[0] ?? null;

  const value = useMemo<BusinessWorkspaceValue>(
    () => ({
      businesses,
      currentBusiness,
      categories,
      locations,
      qrCodes,
      loading,
      qrLoading,
      qrReady: Boolean(currentId && qrLoadedFor === currentId),
      error,
      setCurrentBusinessId: (id: string) => {
        setCurrentId(id);
        storeBusinessId(id);
        setQrCodes([]);
        setQrLoadedFor(null);
        void loadDetails(id);
      },
      refresh,
      loadQrCodes,
    }),
    [
      businesses,
      currentBusiness,
      categories,
      locations,
      qrCodes,
      loading,
      qrLoading,
      qrLoadedFor,
      currentId,
      error,
      refresh,
      loadDetails,
      loadQrCodes,
    ],
  );

  return (
    <BusinessWorkspaceContext.Provider value={value}>
      {children}
    </BusinessWorkspaceContext.Provider>
  );
}

export function useBusinessWorkspace(): BusinessWorkspaceValue {
  const value = useContext(BusinessWorkspaceContext);
  if (!value) {
    throw new Error("useBusinessWorkspace must be used within BusinessWorkspaceProvider");
  }
  return value;
}
