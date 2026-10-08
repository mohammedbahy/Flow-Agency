import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../app/store/store';

/** Typed Redux hooks — use these instead of raw useDispatch/useSelector. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
