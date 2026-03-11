import { NextRequest, NextResponse } from "next/server";

export const config = { matcher: ["/((?!_next|favicon.ico|robots.txt).*)"] };

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get("authorization");

  if (basicAuth) {
    const [scheme, encoded] = basicAuth.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const [user, pass] = decoded.split(":");
      if (
        user === process.env.BASIC_AUTH_USER &&
        pass === process.env.BASIC_AUTH_PASSWORD
      ) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Dashboard"' },
  });
}
