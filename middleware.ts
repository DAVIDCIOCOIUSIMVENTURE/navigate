// import { NextRequest, NextResponse } from 'next/server';
// import { getToken } from 'next-auth/jwt';

// export async function middleware(req: NextRequest) {
//   const token = await getToken({ req });
//   const isAuth = !!token;
//   const { pathname } = req.nextUrl;

//   const isPublic = pathname.startsWith('/signin') ||
//                    pathname.startsWith('/register') ||
//                    pathname.startsWith('/api/auth');

//   if (!isAuth && !isPublic) {
//     const signInUrl = new URL('/signin', req.url);
//     return NextResponse.redirect(signInUrl);
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/((?!_next|favicon.ico).*)'],
// }; 