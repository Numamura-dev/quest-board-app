import {
  seedEntryDefinitions,
  seedExpectations,
  seedNotificationDefinitions,
  seedQuestDefinitions,
  seedReviewDefinitions,
  seedUsers,
} from "../../seed/seedData";

describe("prisma seedData", () => {
  it("操作手順書の確認に必要な主要ユーザーが揃っている", () => {
    const emails = seedUsers.map((user) => user.email);

    expect(emails).toContain(seedExpectations.generalUserEmail);
    expect(emails).toContain(seedExpectations.adminUserEmail);
  });

  it("管理画面で確認する主要ステータスのクエストが揃っている", () => {
    const statuses = new Set(seedQuestDefinitions.map((quest) => quest.status));

    seedExpectations.adminDashboardStatuses.forEach((status) => {
      expect(statuses.has(status)).toBe(true);
    });

    const deletedQuest = seedQuestDefinitions.find(
      (quest) => quest.key === seedExpectations.deletedQuestKey
    );
    expect("deleted_at" in (deletedQuest ?? {})).toBe(true);
  });

  it("一般ユーザーのマイページ表示に必要な状態が揃っている", () => {
    const participantQuestKeys = seedQuestDefinitions
      .filter((quest) =>
        quest.participants.some((participant) => participant.userKey === "general")
      )
      .map((quest) => quest.key);
    const appliedQuestKeys = seedEntryDefinitions
      .filter((entry) => entry.userKey === "general" && entry.status === "pending")
      .map((entry) => entry.questKey);
    const generalNotifications = seedNotificationDefinitions.filter(
      (notification) => notification.userKey === "general"
    );

    expect(participantQuestKeys).toEqual(
      expect.arrayContaining([
        ...seedExpectations.generalUserMypage.participatingQuestKeys,
        ...seedExpectations.generalUserMypage.completedQuestKeys,
      ])
    );
    expect(appliedQuestKeys).toEqual(
      expect.arrayContaining(seedExpectations.generalUserMypage.appliedQuestKeys)
    );
    expect(generalNotifications).toHaveLength(
      seedExpectations.generalUserMypage.notificationCount
    );
  });

  it("レビューは完了済みクエストに対してのみ紐づいている", () => {
    const completedQuestKeys = new Set(
      seedQuestDefinitions
        .filter((quest) => quest.status === "completed")
        .map((quest) => quest.key)
    );

    seedReviewDefinitions.forEach((review) => {
      expect(completedQuestKeys.has(review.questKey)).toBe(true);
    });
  });
});
