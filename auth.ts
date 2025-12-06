// import NextAuth from "next-auth";
// import Google from "next-auth/providers/google";

// export const { handlers, auth, signIn, signOut } = NextAuth({
//   providers: [
//     Google({
//       clientId: process.env.AUTH_GOOGLE_ID ?? "",
//       clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
//     }),
//   ],

//   callbacks: {
//     async jwt({ token, account }) {
//       if (account) {
//         token.accessToken = account.access_token;
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       if (session.user) {
//         session.accessToken = token.accessToken as string;
//       }
//       return session;
//     },
//   },
// });


import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import NextAuth from "next-auth";

export const auth = () => NextAuth(authOptions);