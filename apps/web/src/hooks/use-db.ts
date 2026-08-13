import { useSyncExternalStore } from "react";
import { db } from "@/lib/db";

/** Reactive access ke state lokal (profil, audit, booking, premium, dll). */
export function useDb() {
  return useSyncExternalStore(db.subscribe, db.get, db.getServerSnapshot);
}

/**
 * false saat SSR & render-hydration pertama (store masih snapshot kosong),
 * true setelah hydration — aman untuk inisialisasi state dari store.
 */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
