import DataExtractionPipeline from "@/components/pipelines/data-extraction-pipeline";
import TopMainContent from "@/components/top-main-content";

export default function DataExtractionUUIDPage() {
    return (
        <>
          <TopMainContent title="Data Extraction"/>
          <DataExtractionPipeline/>
        </>
    )
}