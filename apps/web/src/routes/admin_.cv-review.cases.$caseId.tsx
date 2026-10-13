import { Link, createFileRoute } from "@tanstack/react-router";
import { Bot, FileSearch, Package, StickyNote } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@karir-mulai-plus/ui/components/tabs";
import { AiTab } from "@/components/admin/cv-review/ai-tab";
import { CaseHeader } from "@/components/admin/cv-review/case-header";
import { OverviewTab } from "@/components/admin/cv-review/overview-tab";
import { ProductionTab } from "@/components/admin/cv-review/production-tab";
import { ReviewTab } from "@/components/admin/cv-review/review-tab";
import { useAdmin } from "@/lib/cv-review/store";

export const Route = createFileRoute("/admin_/cv-review/cases/$caseId")({
  component: CvReviewCaseDetail,
});

function CvReviewCaseDetail() {
  const { caseId } = Route.useParams();
  const state = useAdmin();
  const c = state.cases.find((x) => x.id === caseId);

  if (!c) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <FileSearch className="mx-auto size-10 text-text-muted" />
        <h1 className="mt-4 font-bricolage text-2xl font-bold text-text-main">Kasus tidak ditemukan</h1>
        <p className="mt-2 font-manrope text-sm text-text-muted">
          Kasus <b>{caseId}</b> tidak ada di antrean.
        </p>
        <Link
          to="/admin/cv-review/pipeline"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3 font-manrope text-sm font-bold text-white"
        >
          Kembali ke pipeline
        </Link>
      </div>
    );
  }

  const openNotes = c.notes.filter((n) => !n.resolved).length;

  return (
    <div className="flex flex-col gap-4">
      <CaseHeader c={c} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 h-auto flex-wrap justify-start gap-1 bg-muted p-1">
          <TabsTrigger value="overview" className="gap-1.5 font-manrope text-xs">
            <Package className="size-3.5" /> Ringkasan
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5 font-manrope text-xs">
            <Bot className="size-3.5" /> Klasifikasi AI
          </TabsTrigger>
          <TabsTrigger value="review" className="gap-1.5 font-manrope text-xs">
            <StickyNote className="size-3.5" /> Review &amp; Catatan
            {openNotes > 0 && (
              <span className="ml-1 rounded-full bg-brand-orange px-1.5 text-[10px] font-bold text-white">
                {openNotes}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="production" className="gap-1.5 font-manrope text-xs">
            <FileSearch className="size-3.5" /> Produksi &amp; Rilis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab c={c} />
        </TabsContent>
        <TabsContent value="ai">
          <AiTab c={c} />
        </TabsContent>
        <TabsContent value="review">
          <ReviewTab c={c} />
        </TabsContent>
        <TabsContent value="production">
          <ProductionTab c={c} />
        </TabsContent>
      </Tabs>
    </div>
  );
}