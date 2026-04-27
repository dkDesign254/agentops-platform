/**
 * NexusOps — AuthPage route wrapper
 *
 * Thin wrapper that renders the AuthPage component.
 * Route: /auth  (query param ?mode=signup for registration)
 */
import AuthPageComponent from "@/components/auth/auth-page";

export default function AuthPage(): JSX.Element {
  return <AuthPageComponent />;
}
