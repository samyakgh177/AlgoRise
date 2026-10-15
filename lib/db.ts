import { PrismaClient } from "./generated/prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";
import { Pool } from "pg";
const gloablForPrisma = globalThis as unknown as{
    prisma: PrismaClient | undefined 
}
const pool = new Pool ({
    connectionString:process.env.DATABASE_URL
})
const adapter = new PrismaPg(pool)

export const prisma = gloablForPrisma.prisma ?? new PrismaClient({
    adapter:adapter
})
if(process.env.NODE_ENV !== "production"){
    gloablForPrisma.prisma = prisma
}
