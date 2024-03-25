import UploadPipeline from "@/components/pipelines/upload-pipeline";
import TopMainContent from "@/components/top-main-content";

export default function UploadPage() {
    return (
        <>
        <TopMainContent title="Upload" displayUploadButton/>
        <UploadPipeline/>
         </>
    )
}