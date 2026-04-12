/*
Style reminder for this file:
- Follow a 16Personalities-like product language: light canvas, generous whitespace, rounded CTA buttons, pastel group blocks, clear hierarchy.
- Avoid the rejected editorial/archive direction.
- Keep the tone restrained, internet-native, slightly dark-humored, and not translation-heavy.
*/

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toPng } from "html-to-image";
import {
  ArrowRight,
  ChevronLeft,
  Download,
  RotateCcw,
  Share2,
  Sparkles,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

import { PersonaAvatar } from "@/components/ai-bti/PersonaAvatar";
import { Button } from "@/components/ui/button";
import {
  calculateQuizResult,
  getSimilarPersonalities,
  groupedPersonalities,
  personalities,
  questions,
  scoringRules,
  siteCopy,
  type AxisResult,
  type PersonalityType,
} from "@/lib/aiBti";

type ViewMode = "landing" | "quiz" | "loading" | "result";

const stagePersonalities = groupedPersonalities.map((group) => group.items[0]);

export default function Home() {
  const [view, setView] = useState<ViewMode>("landing");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [resultCode, setResultCode] = useState<string | null>(null);
  const [loadingLineIndex, setLoadingLineIndex] = useState(0);
  const resultPosterRef = useRef<HTMLDivElement>(null);

  const answeredCount = useMemo(() => Object.keys(responses).length, [responses]);
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  useEffect(() => {
    if (view !== "loading") return;

    const lineTimer = window.setInterval(() => {
      setLoadingLineIndex((prev) => (prev + 1) % siteCopy.loading.lines.length);
    }, 950);

    const resultTimer = window.setTimeout(() => {
      const final = calculateQuizResult(responses);
      setResultCode(final.code);
      setView("result");
    }, 1800);

    return () => {
      window.clearInterval(lineTimer);
      window.clearTimeout(resultTimer);
    };
  }, [responses, view]);

  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  const startQuiz = () => {
    setView("quiz");
    setCurrentIndex(0);
  };

  const goToLanding = () => {
    setView("landing");
  };

  const handleSelect = (optionId: string) => {
    if (!currentQuestion) return;

    setResponses((prev) => ({ ...prev, [currentQuestion.id]: optionId }));

    if (currentIndex < questions.length - 1) {
      window.setTimeout(() => {
        setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
      }, 180);
    }
  };

  const submitQuiz = () => {
    if (answeredCount < questions.length) {
      toast.error("还有题没做完。先把电子人格交代清楚。");
      return;
    }
    setResultCode(null);
    setLoadingLineIndex(0);
    setView("loading");
  };

  const restartQuiz = () => {
    setResponses({});
    setResultCode(null);
    setLoadingLineIndex(0);
    setCurrentIndex(0);
    setView("landing");
  };

  const shareResult = async () => {
    if (!result) return;

    const text = `${siteCopy.result.shareText}${result.personality.nameZh}（${result.personality.type}）——${result.personality.tagline}`;

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

  const downloadAvatar = async () => {
    const avatarEl = document.getElementById("result-avatar-only");
    if (!avatarEl || !result) return;

    try {
      const dataUrl = await toPng(avatarEl, {
        cacheBust: true,
        pixelRatio: 4,
        backgroundColor: "transparent",
      });

      const link = document.createElement("a");
      link.download = `ai-bti-avatar-${result.personality.type.toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("小人形象已保存。");
    } catch {
      toast.error("生成图片失败。");
    }
  };

  const downloadPoster = async () => {
    if (!resultPosterRef.current || !result) return;

    try {
      const dataUrl = await toPng(resultPosterRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: result.personality.palette.soft,
      });

      const link = document.createElement("a");
      link.download = `ai-bti-card-${result.personality.type.toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("个性卡片已生成。内含专属二维码。");
    } catch {
      toast.error("截图失败。可以稍后再试一次。");
    }
  };

  if (view === "quiz" && currentQuestion) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-xl">
          <div className="container flex items-center justify-between py-4">
            <BrandMark />
            <button className="nav-link" onClick={goToLanding}>
              返回首页
            </button>
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

                  <div className="space-y-4">
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
                      className="rounded-full border-slate-300 px-5 py-6 text-sm font-semibold text-slate-600"
                      onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                      disabled={currentIndex === 0}
                    >
                      <ChevronLeft className="mr-2 size-4" />
                      上一题
                    </Button>

                    {currentIndex === questions.length - 1 ? (
                      <Button
                        onClick={submitQuiz}
                        className="cta-primary min-w-[160px] rounded-full px-6 py-6 text-sm font-semibold"
                      >
                        {siteCopy.quiz.submitLabel}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))}
                        disabled={!currentAnswer}
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
                  <p className="text-sm font-semibold text-slate-500">答题状态</p>
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
            <BrandMark />
            <button className="nav-link" onClick={goToLanding}>
              返回首页
            </button>
          </div>
        </header>

        <main className="container flex min-h-[calc(100vh-81px)] items-center justify-center py-10">
          <div className="panel mx-auto max-w-3xl px-8 py-14 text-center md:px-14 md:py-18">
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
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-xl">
          <div className="container flex items-center justify-between py-4">
            <BrandMark />
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
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="section-eyebrow">RESULT</p>
                <h1 className="font-display text-4xl font-bold text-slate-800 md:text-5xl">
                  你的 AI-BTI 结果
                </h1>
                <p className="mt-3 max-w-3xl text-base leading-8 text-slate-500">
                  人格不一定决定命运，但会决定你怎么对一个会回话的输入框上头。
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="rounded-full !px-6" onClick={shareResult}>
                  <Share2 className="mr-2 size-4" />
                  分享结果
                </Button>
                <Button variant="outline" className="rounded-full !px-6" onClick={downloadAvatar}>
                  下载纯小人
                </Button>
                <Button className="cta-primary rounded-full !px-6 py-5" onClick={downloadPoster}>
                  <Download className="mr-2 size-4" />
                  下载人格卡片
                </Button>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
              <section ref={resultPosterRef} className="panel overflow-hidden p-0">
                <div
                  className="relative overflow-hidden px-6 py-8 md:px-10 md:py-10"
                  style={{ background: result.personality.palette.soft }}
                >
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.55)_100%)]" />
                  <div className="relative z-10 grid gap-8 md:grid-cols-[minmax(0,1fr)_260px] md:items-center">
                    <div>
                      <div className="font-display text-xl font-bold uppercase tracking-wider text-slate-500/80 md:text-2xl">
                        {result.personality.type}
                      </div>
                      <h2 className="mt-2 font-display text-[2.8rem] font-bold leading-none text-slate-800 md:text-[3.8rem]">
                        {result.personality.nameZh}
                      </h2>
                      <div className="mt-8">
                        <div className="inline-block rounded-lg border border-slate-400/20 bg-white/40 px-4 py-2 shadow-sm backdrop-blur-sm">
                          <p className="font-brand text-sm font-bold italic text-slate-700/80 md:text-base">
                            “{result.personality.tagline}”
                          </p>
                        </div>
                        <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                          {result.personality.description}
                        </p>
                      </div>
                    </div>
                    <div id="result-avatar-only" className="mx-auto flex justify-center p-4">
                      <PersonaAvatar
                        illustration={result.personality.illustration}
                        size={220}
                        background="rgba(255,255,255,0.18)"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 px-6 py-8 md:grid-cols-[minmax(0,1fr)_320px] md:px-10 md:py-10">
                  <div>
                    <p className="section-eyebrow">{siteCopy.result.whyTitle}</p>
                    <p className="mt-3 text-base leading-8 text-slate-600 md:text-lg">
                      {result.personality.description}
                    </p>
                    <div className="mt-8 flex items-center gap-6 rounded-[28px] bg-white/50 p-6 backdrop-blur-sm">
                      <div className="flex size-18 items-center justify-center rounded-2xl bg-white p-2 shadow-sm">
                        <QRCodeSVG value={window.location.href} size={64} level="L" marginSize={0} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-700">扫码测测你的赛博人格</p>
                        <p className="mt-1 text-xs text-slate-500">{siteCopy.brand.name} · Powered by AI-BTI</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[28px] bg-[#f7f3ef] p-5">
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                      {siteCopy.result.combinationTitle}
                    </p>
                    <div className="mt-4 space-y-3">
                      {result.axes.map((axis) => (
                        <div key={axis.axisId} className="rounded-[22px] bg-white px-4 py-4 shadow-[0_12px_24px_rgba(29,46,72,0.05)]">
                          <div className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold text-slate-600">
                            <span>{axis.leftLabel}</span>
                            <span className="text-slate-400">vs</span>
                            <span>{axis.rightLabel}</span>
                          </div>
                          <AxisMeter axis={axis} compact />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <aside className="space-y-6">
                <div className="panel p-6">
                  <p className="section-eyebrow">{siteCopy.result.axisTitle}</p>
                  <div className="mt-5 space-y-5">
                    {result.axes.map((axis) => (
                      <div key={axis.axisId} className="flex flex-col">
                        <div className="mb-3 flex items-center justify-between font-display text-sm font-bold tracking-tight text-slate-700">
                          <span className={axis.leftPercent >= 50 ? "text-slate-900" : "text-slate-400"}>
                            {axis.leftLabel} ({axis.leftPercent}%)
                          </span>
                          <span className={axis.rightPercent > 50 ? "text-slate-900" : "text-slate-400"}>
                            {axis.rightLabel} ({axis.rightPercent}%)
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
                    ))}
                  </div>
                </div>
              </section>

              <aside className="space-y-6">
                <div className="panel p-8">
                  <p className="section-eyebrow mb-5">INNATE AI</p>
                  <h3 className="font-display text-2xl font-extrabold text-slate-800">
                    {result.personality.innateAIName}
                  </h3>
                  <div className="mt-6 rounded-3xl bg-slate-50 p-6 border border-slate-100">
                    <p className="text-base leading-relaxed text-slate-600">
                      {result.personality.innateAIDescription}
                    </p>
                  </div>
                  <p className="mt-6 text-xs leading-5 text-slate-400 uppercase tracking-widest font-bold opacity-60">
                    The Optimal AI Persona
                  </p>
                </div>
              </aside>
            </div>

            <section className="mt-10">
              <div className="mb-6">
                <p className="section-eyebrow">RESISTANCE MATCH</p>
                <h2 className="font-display text-3xl font-bold text-slate-800">你可能还像...</h2>
                <p className="mt-2 text-sm text-slate-500">基于你的互动风格，以下人格也与你高度契合</p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {recommendations.map((item) => (
                  <div
                    key={item.type}
                    className="group relative overflow-hidden rounded-[32px] bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div 
                          className="absolute inset-0 rounded-full blur-xl opacity-20"
                          style={{ backgroundColor: item.palette.accent }}
                        />
                        <PersonaAvatar illustration={item.illustration} size={80} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {item.type}
                          </span>
                        </div>
                        <h3 className="mt-0.5 text-xl font-bold text-slate-800">{item.nameZh}</h3>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-slate-500 italic">
                      “{item.tagline}”
                    </p>
                    <div 
                      className="absolute bottom-0 left-0 h-1 w-full opacity-30"
                      style={{ backgroundColor: item.palette.accent }}
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-12 flex justify-center">
                <button className="btn-secondary rounded-full px-8 py-4 flex items-center gap-2" onClick={restartQuiz}>
                  <RotateCcw className="size-4" />
                  {siteCopy.result.retakeLabel}
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-xl">
        <div className="container flex items-center justify-between py-4">
          <BrandMark />
          <nav className="hidden items-center gap-8 lg:flex">
            {siteCopy.nav.map((item) => (
              <a key={item.href} href={item.href} className="nav-link">
                {item.label}
              </a>
            ))}
          </nav>
          <Button className="cta-primary rounded-full !px-6 py-5 text-sm font-semibold" onClick={startQuiz}>
            {siteCopy.hero.primaryCta}
          </Button>
        </div>
      </header>

      <main>
        <section className="container pt-14 md:pt-18">
          <div className="mx-auto max-w-4xl text-center">
            <p className="section-eyebrow justify-center">{siteCopy.hero.eyebrow}</p>
            <h1 className="hero-title mt-5">
              在AI眼里，
              <br className="md:hidden" />
              你是哪种人类
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-500 md:text-lg">
              {siteCopy.hero.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button className="cta-primary rounded-full !px-6 py-6 text-base font-semibold" onClick={startQuiz}>
                {siteCopy.hero.primaryCta}
                <ArrowRight className="ml-2 size-4" />
              </Button>
              <a href="#types" className="cta-secondary">
                {siteCopy.hero.secondaryCta}
              </a>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {siteCopy.hero.stats.map((stat) => (
                <div key={stat.label} className="panel px-6 py-5 text-left sm:text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-800">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="hero-stage-wrap mt-16 md:mt-20">
          <div className="hero-stage">
            <div className="container py-16 md:py-20">
              <div className="relative overflow-hidden rounded-[42px] bg-[#eadff0] px-6 py-10 shadow-[0_30px_70px_rgba(80,53,112,0.10)] md:px-10">
                <div className="pointer-events-none absolute inset-0 opacity-[0.22]">
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-display text-[4.4rem] font-black leading-none text-white md:text-[9rem]">
                    AI-BTI
                  </div>
                </div>
                <div className="relative z-10 grid gap-8 md:grid-cols-4">
                  {stagePersonalities.map((item) => (
                    <div key={item.type} className="text-center">
                      <div className="mb-4 flex justify-center">
                        <PersonaAvatar illustration={item.illustration} size={168} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800">{item.nameZh}</h3>
                      <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {item.type}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>


        <section id="types" className="bg-[#f8f4ef] py-16 md:py-22">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <p className="section-eyebrow justify-center">PERSONALITY TYPES</p>
              <h2 className="mt-4 font-display text-3xl font-bold text-slate-800 md:text-4xl">
                {siteCopy.typesIntro.title}
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-500 md:text-lg">
                {siteCopy.typesIntro.description}
              </p>
            </div>

            <div className="mt-10 space-y-10">
              {groupedPersonalities.map((group) => (
                <CampSection key={group.key} title={group.meta.label} description={group.meta.description} soft={group.meta.soft} items={group.items} />
              ))}
            </div>
          </div>
        </section>

        <section id="test" className="container py-16 md:py-22">
          <div className="panel overflow-hidden p-0">
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_320px] md:items-center">
              <div className="px-8 py-10 md:px-10 md:py-12">
                <p className="section-eyebrow">START</p>
                <h2 className="mt-4 font-display text-3xl font-bold text-slate-800 md:text-4xl">
                  现在开始，把你和 AI 之间那点事说清楚。
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-500 md:text-lg">
                  这不是心理学奇迹，也不打算救赎谁。它只是尽量诚实地总结：当你面对一个永远在线、偶尔靠谱、偶尔离谱的模型时，你到底会变成什么样的人。
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button className="cta-primary rounded-full !px-6 py-6 text-base font-semibold" onClick={startQuiz}>
                    {siteCopy.hero.primaryCta}
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                  <button className="cta-secondary" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                    回到顶部
                  </button>
                </div>
              </div>
              <div className="flex justify-center px-6 pb-10 md:px-10 md:py-10">
                <PersonaAvatar illustration={groupedPersonalities[1].items[1].illustration} size={220} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function BrandMark() {
  return (
    <a href="#" className="flex items-center gap-3">
      <div className="relative grid size-9 grid-cols-3 grid-rows-3 gap-[3px] rounded-full bg-white p-[3px] shadow-[0_10px_24px_rgba(29,46,72,0.08)]">
        <span className="rounded-full bg-[#8d77c5]" />
        <span className="rounded-full bg-[#4ca8af]" />
        <span className="rounded-full bg-[#d1a24d]" />
        <span className="rounded-full bg-[#79b56e]" />
        <span className="rounded-full bg-[#d3cadf]" />
        <span className="rounded-full bg-[#9e8acc]" />
        <span className="rounded-full bg-[#7cc6cc]" />
        <span className="rounded-full bg-[#d8b35f]" />
        <span className="rounded-full bg-[#9acc92]" />
      </div>
      <div>
        <div className="font-brand text-[1.75rem] leading-none text-slate-800">AI-BTI</div>
        <p className="-mt-0.5 text-xs tracking-[0.12em] text-slate-400">YOUR AI INTERACTION PERSONALITY TEST</p>
      </div>
    </a>
  );
}

function FeatureCard({
  title,
  description,
  tone,
}: {
  title: string;
  description: string;
  tone: "purple" | "teal" | "green" | "gold";
}) {
  const tones = {
    purple: "bg-[#f2ebfb] text-[#5d4c7d]",
    teal: "bg-[#e8f5f4] text-[#2f6b6d]",
    green: "bg-[#eff8eb] text-[#4d7a47]",
    gold: "bg-[#faf1df] text-[#7a5c27]",
  };

  return (
    <div className="panel p-6">
      <div className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${tones[tone]}`}>
        {title}
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-500">{description}</p>
    </div>
  );
}

function CampSection({
  title,
  description,
  soft,
  items,
}: {
  title: string;
  description: string;
  soft: string;
  items: PersonalityType[];
}) {
  return (
    <section className="rounded-[36px] p-6 md:p-8" style={{ background: soft }}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow">GROUP</p>
          <h3 className="mt-3 font-display text-3xl font-bold text-slate-800">{title}</h3>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-slate-500 md:text-base">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <article key={item.type} className="type-card h-full bg-white/90">
            <div className="flex justify-center">
              <PersonaAvatar illustration={item.illustration} size={140} />
            </div>
            <div className="mt-2 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{item.type}</p>
              <h4 className="mt-2 text-2xl font-bold text-slate-800">{item.nameZh}</h4>
              <p className="mt-1 text-sm font-semibold text-slate-500">{item.subtitle}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AxisMeter({ axis, compact = false }: { axis: AxisResult; compact?: boolean }) {
  return (
    <div>
      <div className={`relative overflow-hidden rounded-full ${compact ? "h-3" : "h-4"} bg-[#ece7e1]`}>
        <div
          className="absolute left-0 top-0 h-full"
          style={{ width: `${axis.leftPercent}%`, background: "linear-gradient(90deg,#4ca8af 0%,#8d77c5 100%)" }}
        />
      </div>
    </div>
  );
}

function InfoList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "good" | "risk";
}) {
  const dotColor = tone === "good" ? "bg-[#79b56e]" : "bg-[#d1a24d]";

  return (
    <div>
      <p className="section-eyebrow">{title}</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3 rounded-[22px] bg-[#f7f3ef] px-4 py-4 text-sm leading-7 text-slate-600">
            <span className={`mt-2 size-2 shrink-0 rounded-full ${dotColor}`} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
