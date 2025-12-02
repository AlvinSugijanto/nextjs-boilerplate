import { GuestGuard } from "@/components/auth";

export default function Layout({ children }) {
  return <GuestGuard>{children}</GuestGuard>;
}
