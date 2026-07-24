import { QuestDataAccessor } from "../dataAccessor/dbAccessor";

interface GetAllQuestsParams {
  keyword?: string;
  status?: string;
}

const questDataAccessor = new QuestDataAccessor();

/**
 * 公開中クエストを検索条件付きで取得する。
 * @param params - 一覧取得時の絞り込み条件
 * @returns 条件に一致したクエスト一覧
 */
export const getAllQuestsService = async ({
  keyword,
  status,
}: GetAllQuestsParams) => {
  const quests = await questDataAccessor.findAll({ keyword, status });
  return quests;
};

/**
 * 管理者向けに削除済みを含むクエスト一覧を取得する。
 * @param params - 一覧取得時の絞り込み条件
 * @returns 条件に一致したクエスト一覧
 */
export const getAllQuestsIncludingDeletedService = async ({
  keyword,
  status,
}: GetAllQuestsParams) => {
  const quests = await questDataAccessor.findAllIncludingDeleted({
    keyword,
    status,
  });
  return quests;
};

/**
 * クエスト ID から 1 件取得する。
 * @param id - 取得対象のクエスト ID
 * @returns クエスト情報。見つからない場合は `null`
 */
export const getQuestByIdService = async (id: number) => {
  const quest = await questDataAccessor.findById(id);
  return quest;
};

/**
 * 削除済みを含めてクエスト ID から 1 件取得する。
 * @param id - 取得対象のクエスト ID
 * @returns クエスト情報。見つからない場合は `null`
 */
export const getQuestByIdIncludingDeletedService = async (id: number) => {
  const quest = await questDataAccessor.findByIdIncludingDeleted(id);
  return quest;
};

/**
 * クエストのステータスを更新する。
 * @param id - 更新対象のクエスト ID
 * @param status - 更新後のステータス
 * @returns 更新後のクエスト情報
 */
export const updateQuestStatusService = async (id: number, status: string) => {
  const quest = await questDataAccessor.updateStatus(id, status);
  return quest;
};

/**
 * クエストと関連報酬を新規作成する。
 * @param questData - 作成対象のクエスト入力値
 * @returns 作成後のクエスト情報
 */
export const createQuestService = async (questData: {
  title: string;
  description: string;
  type: string;
  status: string;
  maxParticipants: number;
  tags: string[];
  start_date: Date;
  end_date: Date;
  incentive_amount: number;
  point_amount: number;
  note: string;
}) => {
  const quest = await questDataAccessor.create({
    title: questData.title,
    description: questData.description,
    type: questData.type,
    status: questData.status,
    maxParticipants: questData.maxParticipants,
    tags: questData.tags,
    start_date: questData.start_date,
    end_date: questData.end_date,
    rewards: {
      create: {
        incentive_amount: questData.incentive_amount,
        point_amount: questData.point_amount,
        note: questData.note,
      },
    },
  });
  return quest;
};

/**
 * 既存クエストと関連報酬を更新する。
 * @param id - 更新対象のクエスト ID
 * @param questData - 更新後のクエスト入力値
 * @returns 更新後のクエスト情報
 */
export const updateQuestService = async (
  id: number,
  questData: {
    title: string;
    description: string;
    type: string;
    status: string;
    maxParticipants: number;
    tags: string[];
    start_date: Date;
    end_date: Date;
    incentive_amount: number;
    point_amount: number;
    note: string;
  }
) => {
  const quest = await questDataAccessor.update(id, {
    title: questData.title,
    description: questData.description,
    type: questData.type,
    status: questData.status,
    maxParticipants: questData.maxParticipants,
    tags: questData.tags,
    start_date: questData.start_date,
    end_date: questData.end_date,
    rewards: {
      update: {
        incentive_amount: questData.incentive_amount,
        point_amount: questData.point_amount,
        note: questData.note,
      },
    },
  });
  return quest;
};

/**
 * クエストを論理削除する。
 * @param id - 削除対象のクエスト ID
 * @returns 削除後のクエスト情報
 */
export const deleteQuestService = async (id: number) => {
  const quest = await questDataAccessor.delete(id);
  return quest;
};

/**
 * 論理削除済みクエストを復元する。
 * @param id - 復元対象のクエスト ID
 * @returns 復元後のクエスト情報
 */
export const restoreQuestService = async (id: number) => {
  const quest = await questDataAccessor.restore(id);
  return quest;
};
