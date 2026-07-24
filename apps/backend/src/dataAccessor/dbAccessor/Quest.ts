import { prisma } from "../../config/db";
import { Quest, QuestParticipant, Reward, User } from "@prisma/client";

/**
 * QuestWithRelations - クエストとその関連データを統合した拡張インターフェース
 */
export interface QuestWithRelations extends Quest {
  // 論理削除用フィールド
  deleted_at: Date | null;

  // 報酬情報（1つのクエストに対して0または1つの報酬）
  rewards: Reward | null;

  // 参加者一覧（クエストに参加しているユーザーの情報）
  // QuestParticipantの情報 + ユーザーの詳細情報を含む
  quest_participants: (QuestParticipant & {
    user: User; // 参加者のユーザー詳細（名前、メール、役割など）
  })[];

  // 集計情報（Prismaの_countフィールドを使用）
  _count: {
    quest_participants: number; // このクエストの参加者数
  };
}

/**
 * クエスト作成用のデータインターフェース
 */
export interface CreateQuestData {
  title: string;
  description: string;
  type: string;
  status: string;
  maxParticipants: number;
  tags: string[];
  start_date: Date;
  end_date: Date;
  rewards?: {
    create: {
      incentive_amount: number;
      point_amount: number;
      note: string;
    };
  };
}

/**
 * クエスト検索用のwhere条件インターフェース
 */
export interface QuestWhereCondition {
  OR?: Array<{
    title?: { contains: string };
    description?: { contains: string };
  }>;
  status?: string;
  deleted_at?: Date | null;
}

/**
 * クエストテーブルと関連データへのアクセスを提供する。
 */
export class QuestDataAccessor {
  /**
   * 全クエスト取得（オプションでキーワード・ステータスで絞り込み）
   *
   * @param params - 検索パラメータ
   * @param params.keyword - タイトル・説明文で検索するキーワード（オプション）
   * @param params.status - クエストのステータスで絞り込み（オプション）
   * @returns 関連データを含むクエスト一覧（開始日順で降順）
   */
  async findAll(params: {
    keyword?: string;
    status?: string;
  }): Promise<QuestWithRelations[]> {
    const where: QuestWhereCondition = {
      deleted_at: null, // 論理削除されていないクエストのみ取得
    };

    // キーワード検索：タイトルまたは説明文にキーワードが含まれるものを検索
    if (params.keyword) {
      where.OR = [
        { title: { contains: params.keyword } },
        { description: { contains: params.keyword } },
      ];
    }

    // ステータス絞り込み：指定されたステータスのクエストのみ取得
    if (params.status) {
      where.status = params.status;
    }

    return (await prisma.quest.findMany({
      where,
      include: {
        rewards: true, // 報酬情報を含める
        quest_participants: {
          // 参加者情報を含める
          include: {
            user: true, // 参加者のユーザー詳細も含める
          },
        },
        _count: {
          // 集計情報を含める
          select: {
            quest_participants: true, // 参加者数を取得
          },
        },
      },
      orderBy: {
        start_date: "desc", // 開始日順で降順（新しい順）
      },
    })) as QuestWithRelations[];
  }

  /**
   * IDでクエスト取得
   *
   * @param id - 取得するクエストのID
   * @returns 関連データを含むクエスト情報、見つからない場合はnull
   */
  async findById(id: number): Promise<QuestWithRelations | null> {
    const quest = await prisma.quest.findFirst({
      where: {
        id,
        deleted_at: null, // 論理削除されていないクエストのみ取得
      } as any,
      include: {
        rewards: true, // 報酬情報を含める
        quest_participants: {
          // 参加者情報を含める
          include: {
            user: true, // 参加者のユーザー詳細も含める
          },
        },
        _count: {
          // 集計情報を含める
          select: {
            quest_participants: true, // 参加者数を取得
          },
        },
      },
    });

    return quest as QuestWithRelations | null;
  }

  /**
   * IDでクエスト取得（削除済みも含む）
   *
   * 復元処理など、deleted_at の状態に関わらずクエストを取得したい場合に使用
   *
   * @param id - 取得するクエストのID
   * @returns 関連データを含むクエスト情報、見つからない場合はnull
   */
  async findByIdIncludingDeleted(
    id: number
  ): Promise<QuestWithRelations | null> {
    const quest = await prisma.quest.findFirst({
      where: {
        id,
      } as any,
      include: {
        rewards: true,
        quest_participants: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            quest_participants: true,
          },
        },
      },
    });

    return quest as QuestWithRelations | null;
  }

  /**
   * クエストのステータス更新
   *
   * @param id - 更新するクエストのID
   * @param status - 新しいステータス
   * @returns 更新後のクエスト情報（関連データ含む）
   */
  async updateStatus(id: number, status: string): Promise<QuestWithRelations> {
    const quest = await prisma.quest.update({
      where: { id },
      data: { status },
      include: {
        rewards: true, // 報酬情報を含める
        quest_participants: {
          // 参加者情報を含める
          include: {
            user: true, // 参加者のユーザー詳細も含める
          },
        },
        _count: {
          // 集計情報を含める
          select: {
            quest_participants: true, // 参加者数を取得
          },
        },
      },
    });

    return quest as QuestWithRelations;
  }

  /**
   * クエスト作成
   *
   * @param data - 作成するクエストのデータ
   * @returns 作成されたクエスト情報（基本情報のみ）
   */
  async create(data: CreateQuestData): Promise<Quest> {
    return await prisma.quest.create({
      data,
    });
  }

  /**
   * クエスト編集
   *
   * @param id - 編集するクエストのID
   * @param data - 編集するクエストのデータ
   * @returns 編集されたクエスト情報（関連データ含む）
   */
  async update(id: number, data: any): Promise<QuestWithRelations> {
    const quest = await prisma.quest.update({
      where: { id },
      data,
      include: {
        rewards: true,
        quest_participants: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            quest_participants: true,
          },
        },
      },
    });

    return quest as QuestWithRelations;
  }

  /**
   * クエスト論理削除
   *
   * @param id - 削除するクエストのID
   * @returns 論理削除されたクエスト情報
   */
  async delete(id: number): Promise<Quest> {
    return await prisma.quest.update({
      where: { id },
      data: {
        deleted_at: new Date(), // 論理削除のタイムスタンプを設定
      } as any,
    });
  }

  /**
   * クエスト復元（論理削除の取り消し）
   *
   * @param id - 復元するクエストのID
   * @returns 復元されたクエスト情報
   */
  async restore(id: number): Promise<Quest> {
    return await prisma.quest.update({
      where: { id },
      data: {
        deleted_at: null, // 論理削除のタイムスタンプを削除
      } as any,
    });
  }

  /**
   * 全クエスト取得（削除済みも含む）- 管理者用
   *
   * @param params - 検索パラメータ
   * @returns 関連データを含むクエスト一覧（削除済みも含む）
   */
  async findAllIncludingDeleted(params: {
    keyword?: string;
    status?: string;
  }): Promise<QuestWithRelations[]> {
    const where: QuestWhereCondition = {};

    // キーワード検索：タイトルまたは説明文にキーワードが含まれるものを検索
    if (params.keyword) {
      where.OR = [
        { title: { contains: params.keyword } },
        { description: { contains: params.keyword } },
      ];
    }

    // ステータス絞り込み：指定されたステータスのクエストのみ取得
    if (params.status) {
      where.status = params.status;
    }

    return (await prisma.quest.findMany({
      where,
      include: {
        rewards: true, // 報酬情報を含める
        quest_participants: {
          // 参加者情報を含める
          include: {
            user: true, // 参加者のユーザー詳細も含める
          },
        },
        _count: {
          // 集計情報を含める
          select: {
            quest_participants: true, // 参加者数を取得
          },
        },
      },
      orderBy: {
        start_date: "desc", // 開始日順で降順（新しい順）
      },
    })) as QuestWithRelations[];
  }
}
