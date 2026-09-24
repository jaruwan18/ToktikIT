import bcrypt from "bcrypt";
import { getPrisma } from "../src/prisma.js";
import {
  CurrentStatus,
  ItPriority,
  RequestedPriority,
  Role,
  TicketMessageType,
} from "@prisma/client";

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
    email: "michael.brown@example.com",
    displayName: "Michael Brown",
    role: Role.REQUESTER,
    isActive: true,
  },
  {
    email: "sarah.williams@example.com",
    displayName: "Sarah Williams",
    role: Role.REQUESTER,
    isActive: true,
  },
  {
    email: "david.miller@example.com",
    displayName: "David Miller",
    role: Role.REQUESTER,
    isActive: true,
  },
  {
    email: "emily.johnson@example.com",
    displayName: "Emily Johnson",
    role: Role.REQUESTER,
    isActive: false,
  },
  {
    email: "it.alex@example.com",
    displayName: "Alex Carter",
    role: Role.IT_STAFF,
    isActive: true,
  },
  {
    email: "it.jordan@example.com",
    displayName: "Jordan Lee",
    role: Role.IT_STAFF,
    isActive: true,
  },
  {
    email: "it.taylor@example.com",
    displayName: "Taylor Smith",
    role: Role.IT_STAFF,
    isActive: true,
  },
  {
    email: "admin@example.com",
    displayName: "System Administrator",
    role: Role.ADMIN,
    isActive: true,
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
  const savedUsers = new Map<
    string,
    {
      id: number;
      email: string;
      displayName: string;
      role: Role;
      isActive: boolean;
    }
  >();

  for (const user of USERS) {
    const savedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        displayName: user.displayName,
        passwordHash,
        role: user.role,
        mustChangePassword: false,
        isActive: user.isActive,
      },
      create: {
        email: user.email,
        displayName: user.displayName,
        passwordHash,
        role: user.role,
        mustChangePassword: false,
        isActive: user.isActive,
      },
    });

    savedUsers.set(user.email, savedUser);
    
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

  // Get seeded records for creating sample tickets
  const jennifer = await prisma.requester.findUniqueOrThrow({
    where: { email: "jennifer.anderson@example.com" },
  });

  const michael = await prisma.requester.findUniqueOrThrow({
    where: { email: "michael.brown@example.com" },
  });

  const sarah = await prisma.requester.findUniqueOrThrow({
    where: { email: "sarah.williams@example.com" },
  });

  const david = await prisma.requester.findUniqueOrThrow({
    where: { email: "david.miller@example.com" },
  });

  const hardwareCategory = await prisma.category.findUniqueOrThrow({
    where: { name: "Hardware" },
  });

  const softwareCategory = await prisma.category.findUniqueOrThrow({
    where: { name: "Software" },
  });

  const networkCategory = await prisma.category.findUniqueOrThrow({
    where: { name: "Network" },
  });

  const accountCategory = await prisma.category.findUniqueOrThrow({
    where: { name: "Account and Access" },
  });

  const corporateLaptop = await prisma.relatedSystem.findUniqueOrThrow({
    where: { name: "Corporate Laptop" },
  });

  const leb2App = await prisma.relatedSystem.findUniqueOrThrow({
    where: { name: "LEB2 App" },
  });

  const campusWifi = await prisma.relatedSystem.findUniqueOrThrow({
    where: { name: "Campus Wi-Fi" },
  });

  const emailSystem = await prisma.relatedSystem.findUniqueOrThrow({
    where: { name: "Email" },
  });

  const alex = savedUsers.get("it.alex@example.com");
  const jordan = savedUsers.get("it.jordan@example.com");
  const taylor = savedUsers.get("it.taylor@example.com");

  if (!alex || !jordan || !taylor) {
    throw new Error("IT Staff users were not created successfully.");
  }

  // Seed sample tickets
  const ticket1 = await prisma.ticket.upsert({
    where: { ticketNumber: "TKT-2026-000001" },
    update: {
      requesterId: jennifer.id,
      categoryId: hardwareCategory.id,
      relatedSystemId: corporateLaptop.id,
      ownerId: alex.id,
      summary: "Corporate laptop cannot start",
      description:
        "The corporate laptop shows a black screen after pressing the power button.",
      requestedPriority: RequestedPriority.HIGH,
      itPriority: ItPriority.HIGH,
      currentStatus: CurrentStatus.IN_PROGRESS,
    },
    create: {
      ticketNumber: "TKT-2026-000001",
      requesterId: jennifer.id,
      categoryId: hardwareCategory.id,
      relatedSystemId: corporateLaptop.id,
      ownerId: alex.id,
      summary: "Corporate laptop cannot start",
      description:
        "The corporate laptop shows a black screen after pressing the power button.",
      requestedPriority: RequestedPriority.HIGH,
      itPriority: ItPriority.HIGH,
      currentStatus: CurrentStatus.IN_PROGRESS,
    },
  });

  const ticket2 = await prisma.ticket.upsert({
    where: { ticketNumber: "TKT-2026-000002" },
    update: {
      requesterId: michael.id,
      categoryId: softwareCategory.id,
      relatedSystemId: leb2App.id,
      ownerId: jordan.id,
      summary: "Cannot submit assignment in LEB2",
      description:
        "The assignment submission page shows an error when uploading a file.",
      requestedPriority: RequestedPriority.MEDIUM,
      itPriority: ItPriority.MEDIUM,
      currentStatus: CurrentStatus.WAITING_FOR_REQUESTER,
    },
    create: {
      ticketNumber: "TKT-2026-000002",
      requesterId: michael.id,
      categoryId: softwareCategory.id,
      relatedSystemId: leb2App.id,
      ownerId: jordan.id,
      summary: "Cannot submit assignment in LEB2",
      description:
        "The assignment submission page shows an error when uploading a file.",
      requestedPriority: RequestedPriority.MEDIUM,
      itPriority: ItPriority.MEDIUM,
      currentStatus: CurrentStatus.WAITING_FOR_REQUESTER,
    },
  });

  const ticket3 = await prisma.ticket.upsert({
    where: { ticketNumber: "TKT-2026-000003" },
    update: {
      requesterId: sarah.id,
      categoryId: networkCategory.id,
      relatedSystemId: campusWifi.id,
      ownerId: null,
      summary: "Campus Wi-Fi connection is unstable",
      description:
        "The Wi-Fi connection disconnects frequently during online classes.",
      requestedPriority: RequestedPriority.HIGH,
      itPriority: ItPriority.HIGH,
      currentStatus: CurrentStatus.OPEN,
    },
    create: {
      ticketNumber: "TKT-2026-000003",
      requesterId: sarah.id,
      categoryId: networkCategory.id,
      relatedSystemId: campusWifi.id,
      ownerId: null,
      summary: "Campus Wi-Fi connection is unstable",
      description:
        "The Wi-Fi connection disconnects frequently during online classes.",
      requestedPriority: RequestedPriority.HIGH,
      itPriority: ItPriority.HIGH,
      currentStatus: CurrentStatus.OPEN,
    },
  });

  const ticket4 = await prisma.ticket.upsert({
    where: { ticketNumber: "TKT-2026-000004" },
    update: {
      requesterId: david.id,
      categoryId: accountCategory.id,
      relatedSystemId: emailSystem.id,
      ownerId: taylor.id,
      summary: "Cannot access university email",
      description:
        "The requester cannot sign in to the university email account.",
      requestedPriority: RequestedPriority.MEDIUM,
      itPriority: ItPriority.MEDIUM,
      currentStatus: CurrentStatus.RESOLVED,
    },
    create: {
      ticketNumber: "TKT-2026-000004",
      requesterId: david.id,
      categoryId: accountCategory.id,
      relatedSystemId: emailSystem.id,
      ownerId: taylor.id,
      summary: "Cannot access university email",
      description:
        "The requester cannot sign in to the university email account.",
      requestedPriority: RequestedPriority.MEDIUM,
      itPriority: ItPriority.MEDIUM,
      currentStatus: CurrentStatus.RESOLVED,
    },
  });

  // Seed public comments and internal notes
  await prisma.ticketMessage.deleteMany({
    where: {
      ticketId: {
        in: [ticket1.id, ticket2.id, ticket3.id, ticket4.id],
      },
    },
  });

  await prisma.ticketMessage.createMany({
    data: [
      {
        ticketId: ticket1.id,
        authorId: jennifer.userId!,
        type: TicketMessageType.COMMENT,
        body: "The laptop is still showing a black screen.",
      },
      {
        ticketId: ticket1.id,
        authorId: alex.id,
        type: TicketMessageType.INTERNAL_NOTE,
        body: "Check the power adapter and perform hardware diagnostics.",
      },
      {
        ticketId: ticket2.id,
        authorId: michael.userId!,
        type: TicketMessageType.COMMENT,
        body: "I have uploaded the assignment again, but the error remains.",
      },
      {
        ticketId: ticket2.id,
        authorId: jordan.id,
        type: TicketMessageType.INTERNAL_NOTE,
        body: "Waiting for the requester to provide the exact error message.",
      },
      {
        ticketId: ticket3.id,
        authorId: sarah.userId!,
        type: TicketMessageType.COMMENT,
        body: "The connection disconnects several times every hour.",
      },
      {
        ticketId: ticket4.id,
        authorId: david.userId!,
        type: TicketMessageType.COMMENT,
        body: "I can access my university email again. Thank you.",
      },
      {
        ticketId: ticket4.id,
        authorId: taylor.id,
        type: TicketMessageType.INTERNAL_NOTE,
        body: "Password reset completed and requester confirmed access.",
      },
    ],
  });

  console.log(`Seeded ${CATEGORIES.length} categories.`);
  console.log(`Seeded ${REQUESTERS.length} requesters.`);
  console.log(`Seeded ${RELATED_SYSTEMS.length} related systems.`);
  console.log(`Seeded ${USERS.length} users.`);
  console.log("Seeded 4 sample tickets.");
  console.log("Seeded public comments and internal notes.");
  console.log(`Initial password: ${INITIAL_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
