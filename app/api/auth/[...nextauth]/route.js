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
      if (account.provider === "google") {
        try {
            const { name, email, id } = user;

            // Check if user exists
             const { data: existingUser, error: fetchError } = await supabase
              .from('user_profile')
              .select('*')
              .eq('user_id', id)
              .maybeSingle()

            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error("Error fetching user:", fetchError);
                return false;
            }

            let profileData;

            if (existingUser) {
                 const { data, error: updateError } = await supabase
                .from('user_profile')
                .update({ updated_at: new Date().toISOString(), name: name, email: email })
                .eq('user_id', id)
                .select()
                .single();

                if (updateError) {
                    console.error("Error updating user:", updateError);
                    return false;
                }
                profileData = data;
            } else {
                 const { data, error: insertError } = await supabase
                .from('user_profile')
                .insert({
                  user_id: id,
                  email: email,
                  name: name,
                  // phone_number, country_code, city are not directly available from basic Google profile
                  // otpless_token is null
                })
                .select()
                .single();

                if (insertError) {
                    console.error("Error inserting user:", insertError);
                    return false;
                }
                profileData = data;
            }

            // Upsert user_info
            const { error: infoError } = await supabase
              .from('user_info')
              .upsert({
                user_id: profileData.user_id,
                identity_type: 'GOOGLE',
                identity_value: email,
                channel: 'OAUTH',
                methods: ['GOOGLE'],
                verified: true,
                verified_at: new Date().toISOString(),
                auth_time: new Date().toISOString()
                // device/network info is not easily available here without request context
              }, { onConflict: 'user_id' });

            if (infoError) {
                console.error("Error upserting user_info:", infoError);
                // We might not want to block signin if this fails, but it's good to know
            }

            return true;
        } catch (error) {
            console.error("SignIn callback error:", error);
            return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
        // We can fetch role here if needed, but existing logic elsewhere seems to fetch it via API
      }
      return session;
    },
    async jwt({ token, user }) {
        if (user) {
            token.sub = user.id;
        }
        return token;
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
