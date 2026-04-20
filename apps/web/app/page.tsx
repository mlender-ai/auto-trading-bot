import { ResearchWorkspace } from "../components/research/ResearchWorkspace";
import { getInitialResearchWorkspace } from "../lib/researchPipelineStore";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialData = await getInitialResearchWorkspace();

  return <ResearchWorkspace initialData={initialData} />;
}
