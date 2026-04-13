import { useEffect, useMemo, useRef, useState, forwardRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toPng } from "html-to-image";
import {
  ArrowRight,
  ChevronLeft,
  Download,
  RotateCcw,
  Share2,
  Sparkles,
  CheckCircle2,
  X
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

import { PersonaAvatar } from "@/components/ai-bti/PersonaAvatar";
import { Button } from "@/components/ui/button";
import {
  calculateQuizResult,
  getPersonalityPoles,
  getSimilarPersonalities,
  personalities,
  questions,
  siteCopy,
  type AxisResult,
  type PersonalityType,
} from "@/lib/aiBti";

type ViewMode = "landing" | "quiz" | "loading" | "result" | "gallery" | "type-detail";

export default function Home() {
  const [view, setView] = useState<ViewMode>("landing");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [resultCode, setResultCode] = useState<string | null>(null);
  const [loadingLineIndex, setLoadingLineIndex] = useState(0);
  const [selectedType, setSelectedType] = useState<PersonalityType | null>(null);
  const [showPoster, setShowPoster] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const resultCardRef = useRef<HTMLDivElement>(null);

  const answeredCount = useMemo(() => Object.keys(responses).length, [responses]);
  const isAllAnswered = answeredCount === questions.length;
  
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? responses[currentQuestion.id] : undefined;
  
  const result = useMemo(() => {
    if (!resultCode) return null;
    return calculateQuizResult(responses);
  }, [responses, resultCode]);

  const recommendations = useMemo(() => {
    if (!result) return [];
    return getSimilarPersonalities(result.personality, personalities, 3);
  }, [result]);

  const progressPercent = (currentIndex / questions.length) * 100;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view, currentIndex]);

  useEffect(() => {
    if (view === "loading") {
      const interval = setInterval(() => {
        setLoadingLineIndex((prev) => (prev + 1) % siteCopy.loading.lines.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [view]);

  const startQuiz = () => {
    setResponses({});
    setCurrentIndex(0);
    setResultCode(null);
    setShowPoster(false);
    setView("quiz");
  };

  const restartQuiz = () => {
    if (view === "result" || view === "type-detail") {
      startQuiz();
      return;
    }
    if (confirm("确定要重新开始吗？当前的进度会丢失。")) {
      startQuiz();
    }
  };

  const goToLanding = () => {
    setResultCode(null);
    setShowPoster(false);
    setView("landing");
  };

  const goToGallery = () => {
    setView("gallery");
  };

  const onViewDetail = (type: PersonalityType) => {
    setSelectedType(type);
    setView("type-detail");
  };

  const handleSelect = (optionId: string) => {
    if (!currentQuestion || isTransitioning) return;

    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));

    if (currentIndex < questions.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const submitQuiz = () => {
    if (!isAllAnswered) {
      toast.error("先把题答完吧，不差这几秒钟。");
      return;
    }
    setView("loading");
    setTimeout(() => {
      setResultCode("DONE");
      setView("result");
    }, 5500);
  };

  const shareResult = async () => {
    if (!result) return;
    const text = `${siteCopy.result.shareText}${result.personality.nameZh} (${result.personality.type})`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${siteCopy.brand.name}｜${result.personality.nameZh}`,
          text,
          url: window.location.href,
        });
        return;
      }

      await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      toast.success("结果文案已复制。现在你可以体面地发朋友圈了。");
    } catch {
      toast.error("分享没成功。可能是浏览器暂时不想配合。");
    }
  };

  const handleGeneratePoster = async () => {
    setShowPoster(true);
    setPosterUrl(null);
    setIsGenerating(true);
    
    // Allow animation/mount to complete
    setTimeout(async () => {
      if (resultCardRef.current) {
        try {
          // Small buffer for QR code / avatar to settle
          await new Promise(r => setTimeout(r, 600));
          const dataUrl = await toPng(resultCardRef.current, { 
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor: '#ffffff'
          });
          setPosterUrl(dataUrl);
        } catch (err) {
          console.error("Poster generation failed", err);
          toast.error("生成失败，请尝试手动截屏。");
        } finally {
          setIsGenerating(false);
        }
      }
    }, 500);
  };

  if (view === "gallery") {
    return <GalleryView onBack={goToLanding} onViewDetail={onViewDetail} />;
  }

  if (view === "type-detail" && selectedType) {
    return (
      <TypeDetailView
        type={selectedType}
        onBack={() => setView("gallery")}
        onRestart={startQuiz}
        onGoHome={goToLanding}
      />
    );
  }

  if (view === "quiz" && currentQuestion) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-xl">
          <div className="container flex items-center justify-between py-4">
            <BrandMark onClick={goToLanding} />
            <Button variant="outline" className="rounded-full" onClick={goToLanding}>
              返回首页
            </Button>
          </div>
        </header>

        <main className="container py-8 md:py-12">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="section-eyebrow">{siteCopy.quiz.progressLabel}</p>
                <h1 className="font-display text-3xl font-bold text-slate-800 md:text-4xl">
                  {siteCopy.quiz.title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
                  {siteCopy.quiz.intro}
                </p>
              </div>
              <div className="rounded-full border border-border/80 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-[0_14px_30px_rgba(29,46,72,0.06)]">
                {currentIndex + 1} / {questions.length}
              </div>
            </div>

            <div className="mb-8 h-3 overflow-hidden rounded-full bg-[#e8e1f0]">
              <motion.div
                className="h-full rounded-full bg-[linear-gradient(90deg,#3ea5ae_0%,#8d77c5_52%,#d1a24d_100%)]"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
              <AnimatePresence mode="wait">
                <motion.section
                  key={currentQuestion.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="panel p-6 md:p-8"
                >
                  <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex rounded-full bg-[#eef6f5] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#4ca8af]">
                        {currentQuestion.axis}
                      </span>
                      <h2 className="mt-5 font-display text-2xl font-bold leading-tight text-slate-800 md:text-[2.15rem]">
                        {currentQuestion.prompt}
                      </h2>
                    </div>
                    <Sparkles className="mt-1 hidden size-5 text-[#8d77c5] md:block" />
                  </div>

                  <div className={`space-y-4 ${isTransitioning ? "pointer-events-none opacity-80" : ""}`}>
                    {currentQuestion.options.map((option, index) => {
                      const active = currentAnswer === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleSelect(option.id)}
                          className={`quiz-option ${active ? "quiz-option-active" : ""}`}
                        >
                          <span className="quiz-option-index">0{index + 1}</span>
                          <span className="flex-1 text-left text-base font-semibold leading-7 text-slate-700 md:text-lg">
                            {option.label}
                          </span>
                          <span
                            className={`size-5 rounded-full border-2 transition ${
                              active
                                ? "border-[#8d77c5] bg-[#8d77c5] shadow-[0_0_0_5px_rgba(141,119,197,0.12)]"
                                : "border-slate-300 bg-white"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-8 flex items-center justify-between gap-4 border-t border-border/70 pt-6">
                   <Button
                      variant="outline"
                      className="rounded-full border-slate-300 !px-6 py-6 text-sm font-semibold text-slate-600"
                      onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                      disabled={currentIndex === 0 || isTransitioning}
                    >
                      <ChevronLeft className="size-4" />
                      上一题
                    </Button>

                    {isAllAnswered || currentIndex === questions.length - 1 ? (
                      <Button
                        onClick={submitQuiz}
                        className="cta-primary min-w-[160px] rounded-full px-6 py-6 text-sm font-semibold shadow-lg"
                      >
                        {isAllAnswered ? "提交结果" : siteCopy.quiz.submitLabel}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))}
                        disabled={!currentAnswer || isTransitioning}
                        className="cta-primary min-w-[140px] rounded-full px-6 py-6 text-sm font-semibold"
                      >
                        {siteCopy.quiz.nextLabel}
                      </Button>
                    )}
                  </div>
                </motion.section>
              </AnimatePresence>

              <aside className="space-y-4">
                <div className="panel p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500">答题状态</p>
                    {isAllAnswered && <CheckCircle2 className="size-4 text-emerald-500" />}
                  </div>
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {questions.map((question, index) => {
                      const answered = Boolean(responses[question.id]);
                      const current = index === currentIndex;
                      return (
                        <button
                          key={question.id}
                          onClick={() => setCurrentIndex(index)}
                          className={`flex aspect-square items-center justify-center rounded-2xl text-sm font-bold transition ${
                            current
                              ? "bg-[#2e6170] text-white shadow-[0_18px_30px_rgba(46,97,112,0.22)]"
                              : answered
                                ? "bg-[#e9f4f3] text-[#2e6170]"
                                : "bg-[#f5f2ef] text-slate-400"
                          }`}
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (view === "loading") {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border/70 bg-background/92 backdrop-blur-xl">
          <div className="container flex items-center justify-between py-4">
            <BrandMark onClick={goToLanding} />
            <Button variant="outline" className="rounded-full" onClick={goToLanding}>
              返回首页
            </Button>
          </div>
        </header>

        <main className="container flex min-h-[calc(100vh-81px)] items-center justify-center py-10">
          <div className="panel mx-auto w-full max-w-4xl px-6 py-14 text-center md:px-14 md:py-18">
            <div className="loading-rings mx-auto mb-10">
              <span />
              <span />
              <span />
            </div>
            <p className="section-eyebrow justify-center">ANALYZING</p>
            <h1 className="mt-4 font-display text-4xl font-bold text-slate-800 md:text-5xl">
              {siteCopy.loading.title}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-500 md:text-lg">
              {siteCopy.loading.lines[loadingLineIndex]}
            </p>
            <div className="mt-10 grid gap-3 sm:grid-cols-4">
              {["消费观", "控制欲", "情感值", "创作力"].map((item) => (
                <div key={item} className="rounded-[24px] bg-[#f7f3ef] px-4 py-5 text-sm font-semibold text-slate-500">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (view === "result" && result) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AnimatePresence>
          {showPoster && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
              onClick={() => setShowPoster(false)}
            >
              <div 
                className="relative max-h-[90vh] overflow-y-auto overflow-x-visible rounded-[32px] no-scrollbar"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  className="absolute right-4 top-4 z-50 flex size-10 items-center justify-center rounded-full bg-white/40 text-slate-800 backdrop-blur-md transition-colors hover:bg-white/60"
                  onClick={() => setShowPoster(false)}
                >
                  <X className="size-5" />
                </button>

                <div className="relative group min-h-[400px] flex items-center justify-center">
                  {isGenerating && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 rounded-[32px] backdrop-blur-sm">
                      <div className="loading-rings scale-75 mb-4">
                        <span />
                        <span />
                        <span />
                      </div>
                      <p className="text-sm font-bold text-slate-500">正在雕琢你的灵魂卡片...</p>
                    </div>
                  )}
                  
                  {posterUrl ? (
                    <img 
                      src={posterUrl} 
                      alt="SBAI Personality Card" 
                      className="w-full h-auto rounded-[32px] shadow-2xl animate-in fade-in zoom-in duration-500"
                    />
                  ) : (
                    <div className={isGenerating ? "opacity-30 scale-95 transition-all duration-500" : "opacity-100"}>
                      <ResultCard ref={resultCardRef} result={result} hideStats forExport />
                    </div>
                  )}
                </div>
                
                <div className="p-4 text-center pb-6">
                  {posterUrl ? (
                     <p className="text-sm font-semibold text-white drop-shadow-md animate-pulse">↑ 长按图片保存 或 手机截图</p>
                  ) : isGenerating ? (
                     <p className="text-sm font-semibold text-white/50">生成中，请稍后...</p>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-xl">
          <div className="container flex items-center justify-between py-4">
            <BrandMark onClick={goToLanding} />
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-full" onClick={goToLanding}>
                返回首页
              </Button>
              <Button className="cta-primary rounded-full px-5" onClick={restartQuiz}>
                再测一次
              </Button>
            </div>
          </div>
        </header>

        <main className="container py-8 md:py-12">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-x-12 gap-y-8 xl:grid-cols-[440px_1fr]">
              <div className="xl:col-start-1 xl:row-start-1 space-y-8">
                <ResultCard result={result} hideStats />
                
                {/* Mobile-only Sharing Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 xl:hidden">
                  <Button variant="outline" className="rounded-full px-5" onClick={shareResult}>
                    <Share2 className="size-4" />
                    {siteCopy.result.shareLabel}
                  </Button>
                  <Button className="cta-primary rounded-full px-5" onClick={handleGeneratePoster}>
                    <Download className="size-4" />
                    {siteCopy.result.downloadLabel}
                  </Button>
                </div>
              </div>

              <div className="xl:col-start-2 xl:row-span-2 space-y-8">
                <section className="panel p-8">
                  <p className="section-eyebrow mb-8">{siteCopy.result.axisTitle}</p>
                  <div className="space-y-10">
                    {result.axes.map((axis) => {
                      const title = axis.axisId === "economy" ? "消费观" : 
                                  axis.axisId === "control" ? "控制欲" : 
                                  axis.axisId === "emotion" ? "情感值" : "创作力";
                      return (
                        <div key={axis.axisId} className="flex flex-col">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{title}</p>
                          <div className="mb-3 flex items-center justify-between font-display text-base font-bold tracking-tight">
                            <span className={axis.leftPercent >= axis.rightPercent ? "text-slate-800" : "text-slate-400"}>
                              {axis.leftLabel}
                            </span>
                            <span className={axis.rightPercent > axis.leftPercent ? "text-slate-800" : "text-slate-400"}>
                              {axis.rightLabel}
                            </span>
                          </div>
                          <AxisMeter axis={axis} />
                          <div className="mt-4 text-left">
                            {axis.leftPercent >= axis.rightPercent ? (
                              <p className="text-sm leading-relaxed text-slate-500">
                                <span className="font-bold text-slate-700">【{axis.leftLabel}】</span>
                                {axis.leftDescription}
                              </p>
                            ) : (
                              <p className="text-sm leading-relaxed text-slate-500">
                                <span className="font-bold text-slate-700">【{axis.rightLabel}】</span>
                                {axis.rightDescription}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="panel p-8">
                  <p className="section-eyebrow mb-5">本命 AI</p>
                  <h3 className="font-display text-2xl font-extrabold text-slate-800">
                    {result.personality.innateAIName}
                  </h3>
                  <div className="mt-6 rounded-3xl bg-slate-50 p-6 border border-slate-100">
                    <p className="text-base leading-relaxed text-slate-600">
                      {result.personality.innateAIDescription}
                    </p>
                  </div>
                </section>
              </div>

              <div className="xl:col-start-1 xl:row-start-2">
                <section className="mt-4 max-w-[400px] mx-auto">
                  <div className="mb-6">
                    <p className="section-eyebrow">RESISTANCE MATCH</p>
                    <h2 className="font-display text-2xl font-bold text-slate-800">你可能还像...</h2>
                  </div>
                  <div className="grid gap-4 grid-cols-1">
                    {recommendations.map((item) => (
                      <div
                        key={item.type}
                        className="group relative overflow-hidden rounded-[32px] bg-white p-5 shadow-sm border border-slate-100 transition-all hover:shadow-md cursor-pointer"
                        onClick={() => onViewDetail(item)}
                      >
                         <div className="flex items-center gap-4">
                          <div className="w-16 h-16 relative">
                            <PersonaAvatar type={item.type} size="100%" radius="8px" />
                          </div>
                          <div>
                             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {item.type}
                            </span>
                            <h3 className="font-bold text-slate-800">{item.nameZh}</h3>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <div className="mt-16 flex flex-col items-center gap-6">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button variant="outline" className="rounded-full px-5" onClick={shareResult}>
                  <Share2 className="size-4" />
                  {siteCopy.result.shareLabel}
                </Button>
                <Button className="cta-primary rounded-full px-5" onClick={handleGeneratePoster}>
                  <Download className="size-4" />
                  {siteCopy.result.downloadLabel}
                </Button>
              </div>
              <button className="btn-secondary rounded-full px-8 py-4 flex items-center gap-1" onClick={restartQuiz}>
                <RotateCcw className="size-4" />
                {siteCopy.result.retakeLabel}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-xl">
        <div className="container flex items-center justify-between py-4">
          <BrandMark onClick={goToLanding} />
          <Button className="cta-primary rounded-full py-5 text-sm font-semibold !px-6" onClick={startQuiz}>
            {siteCopy.hero.primaryCta}
          </Button>
        </div>
      </header>

      <main>
        <section className="container pt-14 md:pt-18 pb-10">
          <div className="mx-auto max-w-4xl text-center">
            <p className="section-eyebrow justify-center">{siteCopy.hero.eyebrow}</p>
            <h1 className="hero-title mt-5">
              在 AI 眼里，<br className="sm:hidden" />
              你是哪种人类
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-500 md:text-lg">
              {siteCopy.hero.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button className="cta-primary rounded-full py-6 text-base font-semibold !px-6" onClick={startQuiz}>
                {siteCopy.hero.primaryCta}
                <ArrowRight className="size-4" />
              </Button>
              <button onClick={goToGallery} className="cta-secondary">
                {siteCopy.hero.secondaryCta}
              </button>
            </div>
            <div className="mt-10 grid gap-3 grid-cols-3">
              {siteCopy.hero.stats.map((stat) => (
                <div key={stat.label} className="panel px-3 py-5 text-center sm:px-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:text-xs">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-base font-bold text-slate-800">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/**
 * COMPACT RESULTS CARD COMPONENT
 */
const ResultCard = forwardRef<HTMLDivElement, { result: any; hideStats?: boolean; forExport?: boolean }>(
  ({ result, hideStats, forExport }, ref) => {
    const poles = getPersonalityPoles(result.code);
    
    return (
      <div 
        ref={ref}
        className="flex flex-col bg-white panel overflow-hidden p-0 w-full max-w-[400px] mx-auto" 
      >
        <div 
          className="relative px-6 py-8 text-center"
          style={{ background: result.personality.palette.soft }}
        >
          <div className="relative z-10 w-full text-center">
             {forExport && <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500/40 mb-2">SBAI PERSONALITY TEST</p>}
            <p className="font-display text-sm font-bold text-slate-400/80 tracking-widest">{result.personality.type}</p>
            <h1 className="mt-1 font-display text-[2rem] leading-none font-black text-slate-800 tracking-tight">{result.personality.nameZh}</h1>
            <div className="mt-4 inline-block rounded-xl border border-slate-400/10 bg-white/40 px-4 py-1.5 backdrop-blur-md">
               <p className="text-xs font-bold italic text-slate-600 leading-relaxed">
                “{result.personality.tagline}”
              </p>
            </div>
          </div>
          
          <div className="relative z-10 mt-4 mx-auto w-3/4">
             <PersonaAvatar type={result.personality.type} radius="12px" className="w-full h-auto shadow-sm" />
          </div>

          <div className="relative z-10 mt-4 rounded-2xl bg-white/60 p-4 border border-white/40 backdrop-blur-sm text-left shadow-xs">
            <p className="text-xs leading-normal text-slate-700">
              {result.personality.description}
            </p>
          </div>
        </div>

        {(!hideStats || forExport) && (
          <div className="bg-white p-6 pb-6">
            <div className="grid grid-cols-4 gap-2">
              {poles.map((pole) => (
                <div key={pole.axisId} className="flex items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-800 tracking-tight">{pole.winnerLabel}</p>
                </div>
              ))}
            </div>

            {forExport && (
              <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="opacity-60 scale-90 origin-left">
                    <BrandMark minimal />
                  </div>
                  <div className="text-left">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-300">SCAN TO TEST</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">SBAI Personality</p>
                  </div>
                </div>
                <div className="bg-white p-1 flex items-center justify-center border border-slate-50">
                  <QRCodeSVG value={window.location.href} size={44} level="L" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

ResultCard.displayName = "ResultCard";

function GalleryView({ 
  onBack, 
  onViewDetail 
}: { 
  onBack: () => void; 
  onViewDetail: (type: PersonalityType) => void;
}) {
  return (
    <div className="min-h-screen bg-[#fcfaf7] text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-xl">
        <div className="container flex items-center justify-between py-4">
          <BrandMark onClick={onBack} />
          <Button variant="outline" className="rounded-full" onClick={onBack}>
            返回首页
          </Button>
        </div>
      </header>

      <main className="container py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <p className="section-eyebrow">TYPE LIBRARY</p>
            <h1 className="mt-4 font-display text-4xl font-bold text-slate-800 md:text-5xl border-l-4 border-[#8d77c5] pl-6">
              16 种 AI 交互人格
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-500">
              探索你在数字世界中的真实映射。每种人格都代表了一种独特的互动哲学与协作模式。
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {personalities.map((item) => (
              <div 
                key={item.type} 
                className="group relative overflow-hidden rounded-[32px] bg-white p-0 shadow-sm border border-slate-100 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
                onClick={() => onViewDetail(item)}
              >
                <div 
                  className="relative h-64 w-full flex items-center justify-center p-8 transition-colors group-hover:bg-slate-50/50"
                  style={{ backgroundColor: item.palette.soft }}
                >
                  <PersonaAvatar type={item.type} radius="12px" />
                </div>
                
                <div className="p-6 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {item.type}
                  </span>
                  <h3 className="mt-2 text-2xl font-black text-slate-800 leading-tight">
                    {item.nameZh}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-slate-500 italic">
                    “{item.tagline}”
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function TypeDetailView({ 
  type, 
  onBack,
  onRestart,
  onGoHome
}: { 
  type: PersonalityType; 
  onBack: () => void;
  onRestart: () => void;
  onGoHome: () => void;
}) {
  const poles = getPersonalityPoles(type.code);

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-xl">
        <div className="container flex items-center justify-between py-4">
          <BrandMark onClick={onGoHome} />
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-full" onClick={onBack}>
              返回列表
            </Button>
            <Button className="cta-primary rounded-full px-5" onClick={onRestart}>
              去测一个
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 xl:grid-cols-[440px_1fr]">
            <section className="w-full">
               <div className="flex flex-col bg-white panel overflow-hidden p-0 relative shadow-sm border border-slate-100">
                <div 
                  className="relative px-8 py-10 text-center pb-8"
                  style={{ background: type.palette.soft }}
                >
                  <div className="relative z-10 w-full text-center">
                    <p className="font-display text-lg font-bold text-slate-400/80 tracking-widest">{type.type}</p>
                    <h1 className="mt-1 font-display text-[2.5rem] leading-none font-black text-slate-800 tracking-tight">{type.nameZh}</h1>
                    <div className="mt-6 inline-block rounded-2xl border border-slate-400/10 bg-white/40 px-5 py-2 backdrop-blur-md">
                       <p className="text-sm font-bold italic text-slate-600 leading-relaxed">
                        “{type.tagline}”
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative z-10 mt-6 w-full">
                     <PersonaAvatar type={type.type} radius="12px" className="w-full h-auto shadow-md" />
                  </div>

                  <div className="relative z-10 mt-6 rounded-3xl bg-white/60 p-5 border border-white/40 backdrop-blur-sm shadow-sm text-left">
                    <p className="text-sm leading-relaxed text-slate-700">
                      {type.description}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="space-y-8">
              <section className="panel p-8">
                <p className="section-eyebrow mb-8">核心特质 / DIMENSIONS</p>
                <div className="space-y-8">
                  {poles.map((pole) => (
                    <div key={pole.axisId} className="flex flex-col border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                      <div className="mb-2 flex items-center justify-between font-display text-base font-bold tracking-tight text-slate-700">
                        <span>{pole.label}：<span className="text-slate-900">{pole.winnerLabel}</span></span>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm leading-relaxed text-slate-500">
                          {pole.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <aside className="panel p-8">
                <p className="section-eyebrow mb-5">本命 AI</p>
                <h3 className="font-display text-2xl font-extrabold text-slate-800">
                  {type.innateAIName}
                </h3>
                <div className="mt-6 rounded-3xl bg-slate-50 p-6 border border-slate-100">
                  <p className="text-base leading-relaxed text-slate-600">
                    {type.innateAIDescription}
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function BrandMark({ onClick, minimal }: { onClick?: () => void; minimal?: boolean }) {
  const content = (
    <>
      <div className="relative grid size-9 grid-cols-3 grid-rows-3 gap-[3px] rounded-full bg-white p-[3px] shadow-[0_10px_24px_rgba(29,46,72,0.08)]">
        <span className="rounded-full bg-[#8d77c5]" />
        <span className="rounded-full bg-[#4ca8af]" />
        <span className="rounded-full bg-[#d1a24d]" />
        <span className="rounded-full bg-[#79b56e]" />
        <span className="rounded-full bg-[#d3cadf]" />
        <span className="rounded-full bg-[#9e8acc]" />
        <span className="rounded-full bg-[#7cc6cc]" />
        <span className="rounded-full bg-[#d8b35f]" />
        <span className="rounded-full bg-[#e8e1f0]" />
      </div>
      {!minimal && (
        <span className="font-display text-xl font-black tracking-tight text-slate-800">
          SBAI
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="flex items-center gap-3 outline-none hover:opacity-80 transition-opacity">
        {content}
      </button>
    );
  }

  return <div className="flex items-center gap-3">{content}</div>;
}

function AxisMeter({ axis }: { axis: AxisResult }) {
  return (
    <div className="relative h-4 w-full overflow-hidden rounded-full bg-[#ece7e1]">
      <div
        className="absolute h-full bg-[#4ca8af] transition-all duration-1000"
        style={{ width: `${axis.leftPercent}%`, left: 0 }}
      />
      <div
        className="absolute h-full bg-[#8d77c5] transition-all duration-1000 opacity-60"
        style={{ width: `${axis.rightPercent}%`, right: 0 }}
      />
      <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white/40" />
    </div>
  );
}
