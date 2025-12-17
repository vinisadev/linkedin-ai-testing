import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      onboardingComplete: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    onboardingComplete: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    onboardingComplete?: boolean;
  }
}
