"use client";

import { useLayoutEffect, useState } from "react";
import { PlayGame, rememberPongPointer } from "../components/PlayGame";
import styles from "./PlayPage.module.css";

const PONG_QUERY = "(width < 684px)";

function isPongView() {
  return window.matchMedia(PONG_QUERY).matches || window.innerWidth < 684;
}

function isInteractiveTouchTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest("a, button, input, textarea, select, [role='button'], [contenteditable='true']"),
  );
}

function isPongUiTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("footer, [data-play-resume-cta]")) ||
    isInteractiveTouchTarget(target);
}

export function PlayPage() {
  const [pong, setPong] = useState(false);

  useLayoutEffect(() => {
    const media = window.matchMedia(PONG_QUERY);
    const onChange = () => setPong(media.matches || window.innerWidth < 684);
    onChange();
    media.addEventListener("change", onChange);
    window.addEventListener("resize", onChange);
    return () => {
      media.removeEventListener("change", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, []);

  useLayoutEffect(() => {
    if (!pong) return;

    document.documentElement.dataset.playMobile = "true";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    document.documentElement.style.touchAction = "none";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.body.style.touchAction = "none";

    return () => {
      delete document.documentElement.dataset.playMobile;
      document.documentElement.style.removeProperty("overflow");
      document.documentElement.style.removeProperty("overscroll-behavior");
      document.documentElement.style.removeProperty("touch-action");
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("overscroll-behavior");
      document.body.style.removeProperty("touch-action");
    };
  }, [pong]);

  useLayoutEffect(() => {
    let capturingId: number | null = null;

    const onTouchStart = (event: TouchEvent) => {
      if (!isPongView()) return;
      if (isPongUiTarget(event.target)) return;
      event.preventDefault();
    };

    const forward = (phase: "down" | "move" | "up", event: PointerEvent) => {
      if (!isPongView()) return;
      if (phase === "down") {
        if (isPongUiTarget(event.target)) return;
        capturingId = event.pointerId;
      } else if (phase === "move") {
        if (capturingId !== event.pointerId) {
          if (isPongUiTarget(event.target)) return;
          capturingId = event.pointerId;
        }
      } else if (capturingId !== event.pointerId) {
        return;
      } else {
        capturingId = null;
      }
      if (event.cancelable && event.pointerType === "touch") event.preventDefault();
      rememberPongPointer({
        phase,
        clientX: event.clientX,
        pointerId: event.pointerId,
        pointerType: event.pointerType,
      });
    };

    const onDown = (event: PointerEvent) => forward("down", event);
    const onMove = (event: PointerEvent) => forward("move", event);
    const onUp = (event: PointerEvent) => forward("up", event);

    document.addEventListener("touchstart", onTouchStart, { capture: true, passive: false });
    document.addEventListener("pointerdown", onDown, { capture: true, passive: false });
    document.addEventListener("pointermove", onMove, { capture: true, passive: false });
    document.addEventListener("pointerup", onUp, { capture: true });
    document.addEventListener("pointercancel", onUp, { capture: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart, { capture: true });
      document.removeEventListener("pointerdown", onDown, { capture: true });
      document.removeEventListener("pointermove", onMove, { capture: true });
      document.removeEventListener("pointerup", onUp, { capture: true });
      document.removeEventListener("pointercancel", onUp, { capture: true });
    };
  }, []);

  return (
    <section
      className={styles.page}
      data-page="play"
      data-play-pong={pong ? "true" : undefined}
    >
      <PlayGame pong={pong} />
    </section>
  );
}
