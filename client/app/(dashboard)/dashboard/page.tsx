import TopMainContent from "@/components/top-main-content";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { Status } from "@prisma/client";
import { DataTable } from "@/components/ui/data-table";
import { Extraction, categories, columns, columnsWithoutStatus, statuses } from "./columns";

async function getExtractions() {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Cannot authenticate user");
  }

  const userUUID = session.user.id;
  const currentExtractions = await prisma.extraction.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      user: {
        id: userUUID,
      },
      NOT: {
        status: Status.PROCESSED,
      },
    },
  });

  const finishedExtractions = await prisma.extraction.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      user: {
        id: userUUID,
      },
      status: Status.PROCESSED,
    },
  });

  return {
    currentExtractions,
    finishedExtractions,
  };
}

export default async function DashboardPage() {
  const { currentExtractions, finishedExtractions } = await getExtractions();
  return (
    <>
      <TopMainContent title="Dashboard" displayUploadButton />
      <div className="m-8 flex flex-col flex-grow items-center justify-center space-y-12 2xl:space-y-20">
        <DataTable
          title="Documents in Pipelines"
          emptyMessage="No documents in pipelines"
          filterColumn={{
            columnId: "filename",
            placeholder: "Filter by file name",
          }}
          columns={columns}
          categories={categories}
          statuses={statuses}
          data={currentExtractions as Extraction[]}
        />
        <DataTable
          title="Latest Data Extractions"
          emptyMessage="No data extractions"
          filterColumn={{
            columnId: "filename",
            placeholder: "Filter by file name",
          }}
          columns={columnsWithoutStatus}
          categories={categories}
          statuses={statuses}
          data={finishedExtractions as Extraction[]}
        />
      </div>
    </>
  );
}