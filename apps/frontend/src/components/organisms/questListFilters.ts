import { type Quest } from "@quest-board/types";

type QuestListFilterParams = {
  selectedFilter: string;
  normalizedSearchQuery: string;
  startDateFilter: string;
  endDateFilter: string;
  hiddenStatuses: readonly string[];
};

const toDateKey = (dateValue: string) => dateValue.slice(0, 10);

const matchesQuestFilter = (
  quest: Quest,
  {
    selectedFilter,
    normalizedSearchQuery,
    startDateFilter,
    endDateFilter,
    hiddenStatuses,
  }: QuestListFilterParams
) => {
  const isHiddenStatus = hiddenStatuses.includes(quest.status as string);
  if (isHiddenStatus) {
    return false;
  }

  const matchesFilter =
    selectedFilter === "all" || quest.status === selectedFilter;
  if (!matchesFilter) {
    return false;
  }

  const matchesSearch =
    normalizedSearchQuery.length === 0 ||
    quest.title.toLowerCase().includes(normalizedSearchQuery) ||
    quest.description.toLowerCase().includes(normalizedSearchQuery) ||
    (quest.tags ?? []).some((tag) =>
      tag.toLowerCase().includes(normalizedSearchQuery)
    );
  if (!matchesSearch) {
    return false;
  }

  const questStartDate = toDateKey(quest.start_date);
  const matchesStartDate =
    !startDateFilter || questStartDate >= startDateFilter;
  const matchesEndDate = !endDateFilter || questStartDate <= endDateFilter;

  return matchesStartDate && matchesEndDate;
};

export const filterQuests = (
  quests: Quest[],
  params: QuestListFilterParams
) => {
  return quests.filter((quest) => matchesQuestFilter(quest, params));
};

export const getSuggestedQuests = (
  quests: Quest[],
  params: QuestListFilterParams
) => {
  if (params.normalizedSearchQuery.length === 0) {
    return [];
  }

  return filterQuests(quests, params)
    .filter((quest) =>
      quest.title.toLowerCase().includes(params.normalizedSearchQuery)
    )
    .slice(0, 5);
};
