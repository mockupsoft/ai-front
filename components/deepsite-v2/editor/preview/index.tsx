"use client";
import { useUpdateEffect } from "react-use";
import { useMemo, useState } from "react";
import classNames from "classnames";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { GridPattern } from "@/components/deepsite-v2/magic-ui/grid-pattern";
import { htmlTagToText } from "@/lib/deepsite/html-tag-to-text";

export const Preview = ({
  html,
  isResizing,
  isAiWorking,
  ref,
  device,
  currentTab,
  iframeRef,
  isEditableModeEnabled,
  onClickElement,
  liveUrl,
  runStatus,
  onRunProject,
}: {
  html: string;
  isResizing: boolean;
  isAiWorking: boolean;
  ref: React.RefObject<HTMLDivElement | null>;
  iframeRef?: React.RefObject<HTMLIFrameElement | null>;
  device: "desktop" | "mobile";
  currentTab: string;
  isEditableModeEnabled?: boolean;
  onClickElement?: (element: HTMLElement) => void;
  liveUrl?: string | null;
  runStatus?: "idle" | "starting" | "running" | "error";
  onRunProject?: () => void;
}) => {
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(
    null
  );

  // add event listener to the iframe to track hovered elements
  const handleMouseOver = (event: MouseEvent) => {
    if (iframeRef?.current) {
      const iframeDocument = iframeRef.current.contentDocument;
      if (iframeDocument) {
        const targetElement = event.target as HTMLElement;
        if (
          hoveredElement !== targetElement &&
          targetElement !== iframeDocument.body
        ) {
          setHoveredElement(targetElement);
          targetElement.classList.add("hovered-element");
        } else {
          return setHoveredElement(null);
        }
      }
    }
  };
  const handleMouseOut = () => {
    setHoveredElement(null);
  };
  const handleClick = (event: MouseEvent) => {
    if (iframeRef?.current) {
      const iframeDocument = iframeRef.current.contentDocument;
      if (iframeDocument) {
        const targetElement = event.target as HTMLElement;
        if (targetElement !== iframeDocument.body) {
          onClickElement?.(targetElement);
        }
      }
    }
  };

  useUpdateEffect(() => {
    const cleanupListeners = () => {
      if (iframeRef?.current?.contentDocument) {
        const iframeDocument = iframeRef.current.contentDocument;
        iframeDocument.removeEventListener("mouseover", handleMouseOver);
        iframeDocument.removeEventListener("mouseout", handleMouseOut);
        iframeDocument.removeEventListener("click", handleClick);
      }
    };

    if (iframeRef?.current) {
      const iframeDocument = iframeRef.current.contentDocument;
      if (iframeDocument) {
        // Clean up existing listeners first
        cleanupListeners();

        if (isEditableModeEnabled) {
          iframeDocument.addEventListener("mouseover", handleMouseOver);
          iframeDocument.addEventListener("mouseout", handleMouseOut);
          iframeDocument.addEventListener("click", handleClick);
        }
      }
    }

    // Clean up when component unmounts or dependencies change
    return cleanupListeners;
  }, [iframeRef, isEditableModeEnabled]);

  const selectedElement = useMemo(() => {
    if (!isEditableModeEnabled) return null;
    if (!hoveredElement) return null;
    return hoveredElement;
  }, [hoveredElement, isEditableModeEnabled]);

  const isLiveMode = !!liveUrl && runStatus === "running";
  const isMultiFileProject =
    html.includes('data-deepsite-preview="project-files"') ||
    html.includes("Proje Dosyaları");
  const iframeSrcProps: { src?: string; srcDoc?: string } =
    isLiveMode && liveUrl
      ? { src: liveUrl }
      : !isMultiFileProject
        ? { srcDoc: html }
        : {};
  const showMultiFilePlaceholder =
    isMultiFileProject && !isLiveMode && runStatus === "idle";
  const multiFileNoSrcYet =
    isMultiFileProject &&
    !isLiveMode &&
    runStatus === "starting" &&
    Object.keys(iframeSrcProps).length === 0;

  return (
    <div
      ref={ref}
      className={classNames(
        "w-full border-l border-gray-900 h-full relative z-0 flex items-center justify-center",
        {
          "lg:p-4": currentTab !== "preview",
          "max-lg:h-0": currentTab === "chat" || currentTab === "files",
          "max-lg:h-full": currentTab === "preview",
        }
      )}
      onClick={(e) => {
        if (isAiWorking) {
          e.preventDefault();
          e.stopPropagation();
          toast.warning("Please wait for the AI to finish working.");
        }
      }}
    >
      <GridPattern
        x={-1}
        y={-1}
        strokeDasharray={"4 2"}
        className={cn(
          "[mask-image:radial-gradient(900px_circle_at_center,white,transparent)]"
        )}
      />

      {isMultiFileProject && !isLiveMode && runStatus === "starting" && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-amber-700/90 text-white text-xs px-3 py-2 rounded-lg">
          <span className="animate-spin size-3 border-2 border-white border-t-transparent rounded-full inline-block" />
          Proje başlatılıyor...
        </div>
      )}

      {isMultiFileProject && !isLiveMode && runStatus === "error" && onRunProject && (
        <div className="absolute top-3 right-3 z-30 flex flex-col items-end gap-1">
          <span className="text-red-400 text-xs bg-red-900/50 px-2 py-1 rounded">Başlatılamadı</span>
          <button
            type="button"
            onClick={onRunProject}
            className="text-xs bg-red-700 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg"
          >
            ↺ Tekrar Dene
          </button>
        </div>
      )}

      {/* Canlı önizleme URL göstergesi + Yeniden Çalıştır */}
      {isLiveMode && liveUrl && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-neutral-900/90 backdrop-blur border border-emerald-600 text-emerald-400 text-xs px-3 py-1.5 rounded-full shadow-lg">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span className="text-emerald-300 font-medium">Çalışıyor</span>
          {onRunProject && (
            <button
              type="button"
              onClick={onRunProject}
              className="ml-1 text-neutral-400 hover:text-white transition-colors"
              title="Yeniden başlat"
            >
              ↺
            </button>
          )}
        </div>
      )}

      {isLiveMode && liveUrl && isMultiFileProject && (
        <div className="absolute top-12 left-1/2 z-30 max-w-md -translate-x-1/2 px-3 text-center text-[10px] leading-snug text-neutral-500">
          Önizleme: Blade şablonları yerel PHP sunucusunda sadeleştirilir; veritabanı yok, tablo/metinler çoğunlukla
          örnektir. Gerçek uygulamayı görmek için projeyi kendi ortamınızda çalıştırın veya{" "}
          <span className="text-neutral-400">Files</span> sekmesinden dosyaları kontrol edin.
        </div>
      )}

      {!isAiWorking && hoveredElement && selectedElement && (
        <div
          className="cursor-pointer absolute bg-sky-500/10 border-[2px] border-dashed border-sky-500 p-3 z-10 pointer-events-none"
          style={{
            top:
              selectedElement.getBoundingClientRect().top +
              (currentTab === "preview" ? 0 : 24),
            left:
              selectedElement.getBoundingClientRect().left +
              (currentTab === "preview" ? 0 : 24),
            width: selectedElement.getBoundingClientRect().width,
            height: selectedElement.getBoundingClientRect().height,
          }}
        >
          <span className="bg-sky-500 text-sm text-neutral-100 px-2 py-0.5 -translate-y-7 absolute top-0 left-0">
            {htmlTagToText(selectedElement.tagName.toLowerCase())}
          </span>
        </div>
      )}
      {device === "mobile" ? (
        <div
          style={{
            width: 320,
            height: 684,
            border: "16px solid #222",
            borderRadius: 40,
            boxShadow: "0 8px 40px #0008",
            position: "relative",
            background: "#111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 10,
              left: "50%",
              transform: "translateX(-50%)",
              width: 60,
              height: 5,
              background: "#444",
              borderRadius: 5,
              zIndex: 3,
            }}
          />
          {showMultiFilePlaceholder && onRunProject ? (
            <div className="flex flex-col items-center justify-center gap-3 text-center px-4 w-[288px] h-[608px] rounded-[28px] bg-neutral-900 border border-neutral-700">
              <p className="text-sm text-neutral-400">Canlı önizleme henüz başlatılmadı</p>
              <button
                type="button"
                onClick={onRunProject}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold"
              >
                ▶ Başlat
              </button>
            </div>
          ) : multiFileNoSrcYet ? (
            <div className="w-[288px] h-[608px] rounded-[28px] bg-black mt-6 mb-6" />
          ) : (
            <iframe
              id="preview-iframe"
              ref={iframeRef}
              title="output"
              className={classNames(
                "w-full h-full select-none transition-all duration-200 bg-black",
                {
                  "pointer-events-none": isResizing || isAiWorking,
                  "rounded-[32px]": false,
                }
              )}
              style={{
                border: "none",
                width: 288,
                height: 608,
                borderRadius: 28,
                marginTop: 24,
                marginBottom: 24,
                background: "#000",
              }}
              {...iframeSrcProps}
              onLoad={() => {
                if (!isLiveMode && iframeRef?.current?.contentWindow?.document?.body) {
                  iframeRef.current.contentWindow.document.body.scrollIntoView({
                    block: isAiWorking ? "end" : "start",
                    inline: "nearest",
                    behavior: isAiWorking ? "instant" : "smooth",
                  });
                }
              }}
            />
          )}
        </div>
      ) : showMultiFilePlaceholder && onRunProject ? (
        <div className="flex flex-col items-center justify-center gap-3 text-center w-full h-full min-h-[240px] bg-neutral-900 border border-neutral-800 rounded-lg">
          <p className="text-sm text-neutral-400">Canlı önizleme henüz başlatılmadı</p>
          <button
            type="button"
            onClick={onRunProject}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold"
          >
            ▶ Başlat
          </button>
        </div>
      ) : multiFileNoSrcYet ? (
        <div className="w-full h-full min-h-[240px] bg-black" />
      ) : (
        <iframe
          id="preview-iframe"
          ref={iframeRef}
          title="output"
          className={classNames(
            "w-full select-none transition-all duration-200 bg-black h-full",
            {
              "pointer-events-none": isResizing || isAiWorking,
              "lg:border-[8px] lg:border-neutral-700 lg:shadow-2xl":
                currentTab !== "preview" && device === "desktop",
            }
          )}
          {...iframeSrcProps}
          onLoad={() => {
            if (!isLiveMode && iframeRef?.current?.contentWindow?.document?.body) {
              iframeRef.current.contentWindow.document.body.scrollIntoView({
                block: isAiWorking ? "end" : "start",
                inline: "nearest",
                behavior: isAiWorking ? "instant" : "smooth",
              });
            }
          }}
        />
      )}
    </div>
  );
};
