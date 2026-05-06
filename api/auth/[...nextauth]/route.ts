import NextAuth from "next-auth";
import { AuthOptions } from "next-auth";

const authOptions: AuthOptions = {
  providers: [
    {
      id: "whop",
      name: "Whop",
      type: "oauth",
      authorization: {
        url: "https://whop.com/oauth/authorize",
        params: { scope: "member:basic:read member:email:read" },
      },
      token: "https://data.whop.com/api/v5/oauth/token",
      userinfo: "https://data.whop.com/api/v5/me",
      clientId: process.env.WHOP_CLIENT_ID,
      clientSecret: process.env.WHOP_CLIENT_SECRET,
      profile(profile: any) {
        return {
          id: profile.id,
          name: profile.username,
          email: profile.email,
          image: profile.profile_pic_url,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account }: any) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: any) {
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// This is the specific fix for the "Not Callable" error
const handler = NextAuth(authOptions);
export const GET = handler;
export const POST = handler;
