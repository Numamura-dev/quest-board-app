"use client";

import QuestDetailPage from "@/components/pages/QuestDetailPage";
import React from "react";

interface QuestPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Page: React.FC<QuestPageProps> = ({ params, searchParams }) => {
  const { id } = React.use(params);
  const searchParamsData = React.use(searchParams);

  // id を使って API からクエストデータを取得
  return (
    <main id="main-content">
      <QuestDetailPage
        questId={id}
        action={searchParamsData.action as string}
      />
    </main>
  );
};

export default Page;
