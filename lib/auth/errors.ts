export function authErrorMessage(message: string) {
  const value = message.toLowerCase();

  if (value.includes("invalid login credentials")) return "Email or password is incorrect.";
  if (value.includes("email not confirmed")) return "Please confirm your email before signing in.";
  if (value.includes("user already registered")) return "An account with this email already exists.";
  if (value.includes("password should be")) return "Your password does not meet the security rules.";
  if (value.includes("rate limit")) return "Too many attempts. Please wait and try again.";

  return "Authentication failed. Please try again.";
}