// import NextAuth from "next-auth";
// import { authOptions } from "@/lib/auth-config";

// const handler = NextAuth(authOptions);

// // export { handler as GET, handler as POST };


// // app/api/auth/[...nextauth]/route.ts
// // app/api/auth/[...nextauth]/route.ts

// export { handler as GET, handler as POST };

// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const authOptions = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };