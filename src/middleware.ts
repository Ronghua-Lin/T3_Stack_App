import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
    afterAuth(auth, req, evt) {
      // Handle users who aren't authenticated
      console.log("afterauth is called!")
      // Allow users visiting public routes to access them
      return NextResponse.next();
    }
  });
 
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
 