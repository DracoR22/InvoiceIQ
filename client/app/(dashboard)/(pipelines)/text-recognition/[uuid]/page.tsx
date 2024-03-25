import TextRecognitionPipeline from "@/components/pipelines/text-recognition-pipeline";
import TopMainContent from "@/components/top-main-content";

export default function TextRecognitionUUIDPage() {
    return (
        <>
          <TopMainContent title="Text Recognition"/>
          <TextRecognitionPipeline/>
        </>
    )
}