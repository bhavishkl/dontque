import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          userId: { label: "User ID", type: "text" },
          idToken: { label: "ID Token", type: "text" },
        },
        async authorize(credentials) {
          if (credentials.userId && credentials.idToken) {
            return {
              id: credentials.userId,
              idToken: credentials.idToken,
            };
          }
          return null;
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.idToken = user.idToken;
        }
        return token;
      },
      async session({ session, token }) {
        session.user = {
          id: token.id,
          idToken: token.idToken,
        };
        return session;
      },
    },
    pages: {
      signIn: "/signin",
    },
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  export { handler as GET, handler as POST };