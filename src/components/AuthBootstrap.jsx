import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetMeQuery } from '../store/api.js';
import { setUser, clearCredentials } from '../store/authSlice.js';

/**
 * On app start, a stored access token has no user attached to it yet —
 * this fetches /users/me once to rehydrate `auth.user` after a refresh.
 */
export default function AuthBootstrap({ children }) {
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.auth.accessToken);
  const user = useSelector((state) => state.auth.user);
  const { data, error } = useGetMeQuery(undefined, {
    skip: !accessToken || Boolean(user),
  });

  useEffect(() => {
    if (data) dispatch(setUser(data));
  }, [data, dispatch]);

  useEffect(() => {
    if (error) dispatch(clearCredentials());
  }, [error, dispatch]);

  // A stored token with no user yet means /users/me is in flight (or about to
  // start) — render nothing until it resolves, otherwise RequireAuth sees a
  // momentarily-null user and redirects to /login before rehydration finishes.
  if (accessToken && !user && !error) {
    return null;
  }

  return children;
}
