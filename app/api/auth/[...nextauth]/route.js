import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from '@/app/lib/supabase';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === 'google') {
        try {
          // Check if the user already exists in the user_profile table by EMAIL
          // We use email to link accounts if the user signed up previously with a different method (like OTPLess)
          // but has the same email.
          const { data: existingUser, error: fetchError } = await supabase
            .from('user_profile')
            .select('*')
            .eq('email', user.email)
            .maybeSingle();

          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching user:', fetchError);
            return false;
          }

          if (existingUser) {
             // The user exists: update updated_at and potentially other fields
             // Note: We do not update user_id here. We stick with the existing user_id.
            const { error: updateError } = await supabase
              .from('user_profile')
              .update({
                updated_at: new Date().toISOString(),
                // Optionally update name/image if they are missing or if we want to sync
                // For now, let's only update if name is missing to respect user changes
                ...(existingUser.name ? {} : { name: user.name }),
                ...(existingUser.image ? {} : { image: user.image }),
              })
              .eq('user_id', existingUser.user_id)
              .select()
              .single();

            if (updateError) {
                console.error('Error updating user:', updateError);
                return false;
            }
          } else {
            // New user: insert details using Google ID as user_id
            const { error: insertError } = await supabase
              .from('user_profile')
              .insert({
                user_id: user.id, // Use Google ID
                email: user.email,
                name: user.name,
                image: user.image,
                // created_at and updated_at are handled by default
              })
              .select()
              .single();

            if (insertError) {
                console.error('Error inserting user:', insertError);
                return false;
            }
          }

          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // On initial sign in, 'user' is defined.
      if (user) {
        // We need to ensure token.id matches the database user_id.
        // If we linked to an existing account with a different ID, user.id (Google ID) might be different from DB ID.

        try {
            const { data: dbUser } = await supabase
                .from('user_profile')
                .select('user_id, role')
                .eq('email', user.email)
                .maybeSingle();

            if (dbUser) {
                token.id = dbUser.user_id;
                token.role = dbUser.role;
            } else {
                // Fallback (shouldn't happen if signIn succeeded)
                token.id = user.id;
                token.role = user.role;
            }
        } catch (error) {
            console.error("Error fetching user in jwt callback", error);
            token.id = user.id;
        }
      }

      // Handle updates to the session (e.g. name change)
      if (trigger === "update" && session?.name) {
          token.name = session.name;
      }

      // If the role is missing in the token (e.g. returning user), fetch it
      // Also double check ID if needed, but usually token persists.
      if (!token.role && token.id) {
          const { data } = await supabase
            .from('user_profile')
            .select('role')
            .eq('user_id', token.id)
            .maybeSingle();
          if (data) {
              token.role = data.role;
          }
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        image: token.picture,
        role: token.role || 'user'
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
