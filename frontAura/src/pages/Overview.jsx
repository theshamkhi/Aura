import { useAuth } from '../context/AuthContext';

export const Overview = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
    </div>
  );
};