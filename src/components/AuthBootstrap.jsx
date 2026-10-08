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
  const { data, error, isLoading } = useGetMeQuery(undefined, {
    skip: !accessToken || Boolean(user),
  });

  useEffect(() => {
    if (data) dispatch(setUser(data));
  }, [data, dispatch]);

  useEffect(() => {
    if (error) dispatch(clearCredentials());
  }, [error, dispatch]);

  if (accessToken && !user && isLoading) {
    return null;
  }

  return children;
}
