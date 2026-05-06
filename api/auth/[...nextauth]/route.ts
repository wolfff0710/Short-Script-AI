import NextAuth from "next-auth";

export const authOptions = {
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
      // These MUST match the names you put in Vercel exactly
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
      session.accessToken = token.accessToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
