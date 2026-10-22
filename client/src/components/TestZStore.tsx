import { create } from "zustand";

interface TestZustandProps {
  filter: string;
  notice: string;
  setFilter: (filter: string) => void;
  setNotice: (notice: string) => void;
}
export const useZustandStore = create<TestZustandProps>((set) => ({
  filter: "",
  notice: "",
  setFilter: (filter) => set(() => ({ filter: filter })),
  setNotice: (notice) => set(() => ({ notice: notice })),
}));
