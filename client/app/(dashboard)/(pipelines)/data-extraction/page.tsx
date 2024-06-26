import TopMainContent from "@/components/top-main-content"
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { getExtractions } from "@/lib/requests";
import { Extraction, Status } from "@prisma/client";

export default async function DataExtractionPage() {
  const extractions = await getExtractions(Status.TO_EXTRACT);
  return (
    <div className="flex flex-col h-full">
      <TopMainContent title="Data Extraction" displayUploadButton />
      <div className="m-8 flex flex-col flex-grow items-center justify-center space-y-12 2xl:space-y-20">
        <DataTable
          title="Documents in Current Pipeline"
          pageSize={10}
          emptyMessage="No documents in Data Extraction Pipeline"
          filterColumn={{
            columnId: "filename",
            placeholder: "Filter by file name",
          }}
          columns={columns}
          data={extractions as Extraction[]}
        />
      </div>
    </div>
  );
}