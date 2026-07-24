import { prisma } from "../src/config/db";
import {
  seedClearSubmissionDefinitions,
  seedEntryDefinitions,
  seedExpectations,
  seedFeedbackDefinitions,
  seedIncentivePaymentDefinitions,
  seedNotificationDefinitions,
  seedOfferDefinitions,
  seedPointTransactionDefinitions,
  seedQuestDefinitions,
  seedReviewDefinitions,
  seedUsers,
} from "../src/seed/seedData";

const getUserByKey = async (key: (typeof seedUsers)[number]["key"]) => {
  const userDefinition = seedUsers.find((user) => user.key === key);
  if (!userDefinition) {
    throw new Error(`Unknown user key: ${key}`);
  }

  const user = await prisma.user.findUnique({
    where: { email: userDefinition.email },
  });
  if (!user) {
    throw new Error(`User not found after seed: ${userDefinition.email}`);
  }

  return user;
};

async function main() {
  await prisma.questParticipant.deleteMany();
  await prisma.entry.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.clearSubmission.deleteMany();
  await prisma.incentivePayment.deleteMany();
  await prisma.pointTransaction.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.quest.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: seedUsers.map(({ key: _key, ...user }) => user),
  });

  const userMap = new Map<
    (typeof seedUsers)[number]["key"],
    Awaited<ReturnType<typeof getUserByKey>>
  >();
  for (const userDefinition of seedUsers) {
    userMap.set(userDefinition.key, await getUserByKey(userDefinition.key));
  }

  const questMap = new Map<(typeof seedQuestDefinitions)[number]["key"], { id: number; title: string }>();
  for (const questDefinition of seedQuestDefinitions) {
    const quest = await prisma.quest.create({
      data: {
        title: questDefinition.title,
        description: questDefinition.description,
        type: questDefinition.type,
        status: questDefinition.status,
        maxParticipants: questDefinition.maxParticipants,
        tags: questDefinition.tags,
        start_date: questDefinition.start_date,
        end_date: questDefinition.end_date,
        deleted_at: questDefinition.deleted_at ?? null,
        rewards: {
          create: questDefinition.reward,
        },
        quest_participants: {
          create: questDefinition.participants.map((participant) => ({
            user: { connect: { id: userMap.get(participant.userKey)!.id } },
            completed_at: participant.completed_at ?? null,
            cleared_at: participant.cleared_at ?? null,
            feedback_submitted: participant.feedback_submitted ?? false,
          })),
        },
      },
    });

    questMap.set(questDefinition.key, { id: quest.id, title: quest.title });
  }

  await prisma.entry.createMany({
    data: seedEntryDefinitions.map((entry) => ({
      user_id: userMap.get(entry.userKey)!.id,
      quest_id: questMap.get(entry.questKey)!.id,
      reason: entry.reason,
      status: entry.status,
      applied_at: entry.applied_at,
    })),
  });

  await prisma.offer.createMany({
    data: seedOfferDefinitions.map((offer) => ({
      user_id: userMap.get(offer.userKey)!.id,
      quest_id: questMap.get(offer.questKey)!.id,
      reason: offer.reason,
      status: offer.status,
      sent_at: offer.sent_at,
      responded_at: offer.responded_at ?? null,
    })),
  });

  await prisma.notification.createMany({
    data: seedNotificationDefinitions.map((notification) => ({
      user_id: userMap.get(notification.userKey)!.id,
      message: notification.message,
      is_read: notification.is_read,
      created_at: notification.created_at,
      read_at: notification.read_at ?? null,
    })),
  });

  await prisma.clearSubmission.createMany({
    data: seedClearSubmissionDefinitions.map((submission) => ({
      user_id: userMap.get(submission.userKey)!.id,
      quest_id: questMap.get(submission.questKey)!.id,
      submission_url: submission.submission_url,
      status: submission.status,
      submitted_at: submission.submitted_at,
      reviewed_at: submission.reviewed_at ?? null,
    })),
  });

  await prisma.feedback.createMany({
    data: seedFeedbackDefinitions.map((feedback) => ({
      user_id: userMap.get(feedback.userKey)!.id,
      quest_id: questMap.get(feedback.questKey)!.id,
      comment: feedback.comment,
      created_at: feedback.created_at,
    })),
  });

  await prisma.incentivePayment.createMany({
    data: seedIncentivePaymentDefinitions.map((payment) => ({
      user_id: userMap.get(payment.userKey)!.id,
      quest_id: questMap.get(payment.questKey)!.id,
      incentive_amount: payment.incentive_amount,
      status: payment.status,
      paid_at: payment.paid_at ?? null,
    })),
  });

  await prisma.pointTransaction.createMany({
    data: seedPointTransactionDefinitions.map((transaction) => ({
      user_id: userMap.get(transaction.userKey)!.id,
      quest_id: transaction.questKey ? questMap.get(transaction.questKey)!.id : null,
      point_amount: transaction.point_amount,
      reason_type: transaction.reason_type,
      granted_at: transaction.granted_at,
    })),
  });

  await prisma.review.createMany({
    data: seedReviewDefinitions.map((review) => ({
      reviewer_id: userMap.get(review.reviewerKey)!.id,
      quest_id: questMap.get(review.questKey)!.id,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
    })),
  });

  console.log("Seed completed:", {
    users: seedUsers.length,
    quests: seedQuestDefinitions.length,
    reviews: seedReviewDefinitions.length,
    notifications: seedNotificationDefinitions.length,
    generalUserEmail: seedExpectations.generalUserEmail,
    adminUserEmail: seedExpectations.adminUserEmail,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
