import { useSelector } from 'react-redux';

export const useAuth = () => {
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);

  return {
    user,
    isAuthenticated: Boolean(accessToken),
    isAdmin: user?.role === 'admin',
  };
};
