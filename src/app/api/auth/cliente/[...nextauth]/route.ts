import NextAuth from "next-auth";
import { authOptionsCliente } from "@/auth-cliente";

const handler = NextAuth({
  ...authOptionsCliente,
  basePath: "/api/auth/cliente",
});
export { handler as GET, handler as POST };
