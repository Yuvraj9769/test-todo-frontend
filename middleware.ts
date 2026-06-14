import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {

    console.log("Middleware executed for path: ", req.nextUrl.pathname);

    return NextResponse.next();

}


export const config = {
    matcher: ["/", "/todos"]
}