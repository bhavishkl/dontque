import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        userId: { label: "User ID", type: "text" },
        phoneNumber: { label: "Phone Number", type: "text" },
      },
      async authorize(credentials) {
        if (credentials.userId && credentials.phoneNumber) {
          return {
            id: credentials.userId,
            phoneNumber: credentials.phoneNumber,
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
        token.phoneNumber = user.phoneNumber;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        phoneNumber: token.phoneNumber,
        name: token.name,
        image: token.image,
        role: token.role || null
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