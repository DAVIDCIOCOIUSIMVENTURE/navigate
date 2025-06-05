/**
 * Singleton PrismaClient instance to prevent exhausting database connections.
 * 
 * In development, Next.js hot reloads can create multiple instances causing
 * too many open connections. This module caches the PrismaClient globally
 * to reuse the same instance across reloads.
 * 
 * In production (serverless environments), each instance creates one PrismaClient
 * reused for all requests handled by that instance.
 */

import { PrismaClient } from '@prisma/client';

// Declare a global variable on the `globalThis` object
// to hold the PrismaClient instance across hot reloads.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if the PrismaClient instance already exists in the global scope.
// If yes, reuse it; if no, create a new one.
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// In development (non-production), assign the new PrismaClient instance
// to the global scope to reuse on subsequent hot reloads.
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;