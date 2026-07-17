import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { hash } from "../src/lib/password.js";

const prisma = new PrismaClient();

async function main() {
  const alicePassword = await hash("password123");
  const bobPassword = await hash("password123");
  const charliePassword = await hash("password123");

  const alice = await prisma.admin.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      name: "Alice Johnson",
      email: "alice@example.com",
      password: alicePassword,
    },
  });

  const bob = await prisma.admin.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      name: "Bob Smith",
      email: "bob@example.com",
      password: bobPassword,
    },
  });

  const charlie = await prisma.user.upsert({
    where: { email: "charlie@example.com" },
    update: {},
    create: {
      name: "Charlie Brown",
      email: "charlie@example.com",
      password: charliePassword,
    },
  });

  const workingHoursData = [
    { adminId: alice.id, dayOfWeek: "mon", startTime: "09:00", endTime: "18:00" },
    { adminId: alice.id, dayOfWeek: "tue", startTime: "09:00", endTime: "18:00" },
    { adminId: alice.id, dayOfWeek: "wed", startTime: "09:00", endTime: "18:00" },
    { adminId: alice.id, dayOfWeek: "thu", startTime: "09:00", endTime: "18:00" },
    { adminId: alice.id, dayOfWeek: "fri", startTime: "09:00", endTime: "18:00" },
    { adminId: bob.id, dayOfWeek: "mon", startTime: "10:00", endTime: "17:00" },
    { adminId: bob.id, dayOfWeek: "wed", startTime: "10:00", endTime: "17:00" },
    { adminId: bob.id, dayOfWeek: "fri", startTime: "10:00", endTime: "16:00" },
  ];

  for (const wh of workingHoursData) {
    await prisma.workingHour.create({ data: wh });
  }

  const meetingTypesData = [
    { adminId: alice.id, duration: 15, category: "single" },
    { adminId: alice.id, duration: 30, category: "group", allowGuestInvite: true },
    { adminId: bob.id, duration: 30, category: "single" },
    { adminId: bob.id, duration: 30, category: "private", visible: false },
  ];

  for (const mt of meetingTypesData) {
    await prisma.meetingType.create({ data: mt });
  }

  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const aliceMeetingTypes = await prisma.meetingType.findMany({
    where: { adminId: alice.id },
  });

  if (aliceMeetingTypes.length > 0) {
    await prisma.meet.create({
      data: {
        adminId: alice.id,
        userId: charlie.id,
        meetingTypeId: aliceMeetingTypes[0].id,
        startTime: new Date(today.getTime() + 10 * 3600000),
        endTime: new Date(today.getTime() + 10 * 3600000 + aliceMeetingTypes[0].duration * 60000),
        theme: "Intro call",
        inviteLink: crypto.randomUUID(),
        status: "confirmed",
      },
    });

    await prisma.meet.create({
      data: {
        adminId: alice.id,
        userId: charlie.id,
        meetingTypeId: aliceMeetingTypes.length > 1 ? aliceMeetingTypes[1].id : aliceMeetingTypes[0].id,
        startTime: new Date(tomorrow.getTime() + 14 * 3600000),
        endTime: new Date(tomorrow.getTime() + 14 * 3600000 + 30 * 60000),
        theme: "Product demo",
        comment: "Show new features",
        guestEmails: ["guest@example.com"],
        inviteLink: crypto.randomUUID(),
        status: "confirmed",
      },
    });

    await prisma.meet.create({
      data: {
        adminId: alice.id,
        userId: charlie.id,
        meetingTypeId: aliceMeetingTypes[0].id,
        startTime: new Date(dayAfter.getTime() + 11 * 3600000),
        endTime: new Date(dayAfter.getTime() + 11 * 3600000 + 15 * 60000),
        theme: "Quick sync",
        inviteLink: crypto.randomUUID(),
        status: "cancelled",
      },
    });
  }
}

main()
  .then(() => {
    console.log("Seed completed");
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error("Seed failed:", e);
    return prisma.$disconnect().then(() => process.exit(1));
  });
