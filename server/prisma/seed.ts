import bcrypt from "bcrypt";
import { getPrisma } from "../src/prisma.js";
import { Role } from "@prisma/client";

export const CATEGORIES = [
  "Account and Access",
  "Hardware",
  "Software",
  "Network",
];

export const REQUESTERS = [
  {
    name: "Jennifer Anderson",
    email: "jennifer.anderson@example.com",
    isActive: true,
  },
  {
    name: "Michael Brown",
    email: "michael.brown@example.com",
    isActive: true,
  },
  {
    name: "Sarah Williams",
    email: "sarah.williams@example.com",
    isActive: true,
  },
  {
    name: "David Miller",
    email: "david.miller@example.com",
    isActive: true,
  },
  {
    name: "Emily Johnson",
    email: "emily.johnson@example.com",
    isActive: false,
  },
];

export const RELATED_SYSTEMS = [
  "Email",
  "Campus Wi-Fi",
  "VPN",
  "LEB2 App",
  "Grade Submission App",
  "Printer",
  "Corporate Laptop",
];

export const USERS = [
  {
    email: "jennifer.anderson@example.com",
    displayName: "Jennifer Anderson",
    role: Role.REQUESTER,
    isActive: true,
  },
  {
    email: "it.staff@example.com",
    displayName: "IT Staff",
    role: Role.IT_STAFF,
    isActive: true,
  },
  {
    email: "admin@example.com",
    displayName: "System Administrator",
    role: Role.ADMIN,
    isActive: true,
  },
  {
    email: "emily.johnson@example.com",
    displayName: "Emily Johnson",
    role: Role.REQUESTER,
    isActive: false,
  },
];

const INITIAL_PASSWORD = "Password123!";

async function main() {
  const prisma = getPrisma();

  const passwordHash = await bcrypt.hash(INITIAL_PASSWORD, 12);

  // Seed Categories
  for (const name of CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Seed Requesters
  for (const requester of REQUESTERS) {
    await prisma.requester.upsert({
      where: { email: requester.email },
      update: {
        name: requester.name,
        isActive: requester.isActive,
      },
      create: requester,
    });
  }

  // Seed Related Systems
  for (const name of RELATED_SYSTEMS) {
    await prisma.relatedSystem.upsert({
      where: { name },
      update: {},
      create: {
        name,
        isActive: true,
      },
    });
  }

  // Seed Users
  for (const user of USERS) {
    const savedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        displayName: user.displayName,
        role: user.role,
        isActive: user.isActive,
      },
      create: {
        email: user.email,
        displayName: user.displayName,
        passwordHash,
        role: user.role,
        mustChangePassword: true,
        isActive: user.isActive,
      },
    });

    if (user.role === Role.REQUESTER) {
      await prisma.requester.update({
        where: { email: user.email },
        data: {
          userId: savedUser.id,
          name: user.displayName,
          isActive: user.isActive,
        },
      });
    }
  }

  console.log(`Seeded ${CATEGORIES.length} categories.`);
  console.log(`Seeded ${REQUESTERS.length} requesters.`);
  console.log(`Seeded ${RELATED_SYSTEMS.length} related systems.`);
  console.log(`Seeded ${USERS.length} users.`);
  console.log(`Initial password: ${INITIAL_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });