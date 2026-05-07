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
  secret: process.env.NEXTAUTH_SECRET,
};

export default (req: any, res: any) => NextAuth(req, res, authOptions);
