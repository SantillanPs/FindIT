import { useAuth } from '../context/AuthContext';

/**
 * Hook to manage feature flags and beta access
 */
export const useFeatureFlags = () => {
  const { user } = useAuth();

  // A user has access to beta/dev features if:
  // 1. They are an Admin or Super Admin
  // 2. They have the is_beta_tester flag set to true
  const hasBetaAccess = user?.role === 'admin' || 
                       user?.role === 'super_admin' || 
                       !!user?.is_beta_tester;

  return {
    hasBetaAccess,
    // Add specific feature flags here for more granular control in the future
    showHallOfIntegrity: hasBetaAccess,
    showAssetVault: hasBetaAccess,
  };
};
