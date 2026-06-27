import { redirect } from "next/navigation";

/**
 * Root page – redirects to /dashboard.
 * This avoids a blank page at "/" while keeping the root layout clean.
 */
export default function RootPage() {
  redirect("/dashboard");
}
