import { StatusAlert } from "@/components/ui/status-alert";

interface AuthFormErrorProps {
  message?: string;
  code?: string;
  id?: string;
}

export function AuthFormError({ message, code, id }: AuthFormErrorProps) {
  if (!message) return null;

  const status =
    code === "VALIDATION_ERROR"
      ? "warning"
      : code === "INVALID_CREDENTIALS" ||
          code === "AUTHORIZATION_ERROR" ||
          code === "EXPIRED_TOKEN"
        ? "error"
        : "error";

  return (
    <StatusAlert
      id={id}
      role="alert"
      aria-live="polite"
      status={status}
      title="Unable to continue"
      description={message}
    />
  );
}

export function AuthFormSuccess({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <StatusAlert
      status="success"
      title="Success"
      description={message}
    />
  );
}
