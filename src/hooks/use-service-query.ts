import { useEffect, useState } from "react";
import type { ServiceResult } from "@/types";
import { isFailure } from "@/types";

type QueryState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: T };

export function useServiceQuery<T>(
  query: () => Promise<ServiceResult<T>>,
  deps: readonly unknown[] = [],
): QueryState<T> {
  const [state, setState] = useState<QueryState<T>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    query()
      .then((result) => {
        if (cancelled) return;
        if (isFailure(result)) {
          setState({ status: "error", message: result.error.message });
          return;
        }
        setState({ status: "success", data: result.data });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : "Something went wrong";
        setState({ status: "error", message });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
