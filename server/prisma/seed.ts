import { getPrisma } from "../src/prisma.js";

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

async function main() {
  const prisma = getPrisma();

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

  console.log(`Seeded ${CATEGORIES.length} categories.`);
  console.log(`Seeded ${REQUESTERS.length} requesters.`);
  console.log(`Seeded ${RELATED_SYSTEMS.length} related systems.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });