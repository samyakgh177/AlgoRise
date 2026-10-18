
"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export const onBoardUser = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return {
        success: false,
        error: "No authenticated user found",
      };
    }

    const {
      id,
      firstName,
      lastName,
      imageUrl,
      emailAddresses,
    } = user;

    const email = emailAddresses[0]?.emailAddress;

    if (!email) {
      return {
        success: false,
        error: "No email address found",
      };
    }

    const newUser = await prisma.user.upsert({
      where: {
        clerkId: id,
      },
      update: {
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        imageUrl: imageUrl ?? null,
        email,
      },
      create: {
        clerkId: id,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        imageUrl: imageUrl ?? null,
        email,
      },
    });

    return {
      success: true,
      user: newUser,
    };
  } catch (error: any) {
    if (error?.digest) {
      throw error;
    }
    console.error("Error onboarding user:", error);

    return {
      success: false,
      error: "Failed to onboard user",
    };
  }
};

export const currentUserRole = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return null;
    }

    const { id } = user;
    const userRole = await prisma.user.findUnique({
      where: {
        clerkId: id,
      },
      select: {
        role: true,
      },
    });
    return userRole?.role ?? null;
  } catch (error: any) {
    if (error?.digest) {
      throw error;
    }
    console.error("Error fetching user role:", error);
    return null;
  }
};

export const getCurrentUserData = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return null;
    }
    const data = await prisma.user.findUnique({
      where: {
        clerkId: user.id,
      },
      include: {
        submissions: {
          orderBy: { createdAt: "desc" },
        },
        solvedProblems: {
          orderBy: { createdAt: "desc" },
        },
        playlists: {
          orderBy: { createdAt: "desc" },
          include: {
            problems: {
              include: {
                problem: true,
              },
            },
          },
        },
      },
    });
    return data;
  } catch (error: any) {
    if (error?.digest) {
      throw error;
    }
    console.error("Error fetching current user data:", error);
    return null;
  }
};