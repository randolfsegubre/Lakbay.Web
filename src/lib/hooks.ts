// Pre-typed react-redux hooks — the standard Redux Toolkit + TypeScript
// pattern. Import these instead of the plain useDispatch/useSelector so
// every call site gets AppDispatch/RootState's real types automatically,
// rather than every component re-typing `useSelector<RootState>(...)` by hand.
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { AppDispatch, RootState } from "./store";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
