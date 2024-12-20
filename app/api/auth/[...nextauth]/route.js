import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
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
        name: token.name,
        image: token.image,
      };
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/quick-join/')) {
        return url;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };