"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./TerminalPlayground.module.css";

const RESPONSES: Record<string, string[]> = {
  whoami: ["ishan"],
  "cat about.txt": [
    "Artist and Engineer",
    "builds immersive interactive installations",
    "product lead at Citibank",
    "Aerospace Engineering \u2192 High Performance Scientific Computing \u2192 Data Science \u2192 Design \u2192 Art",
  ],
  "cat tags.txt": [
    "multidisciplinary\tinteractive\ttechnologist\tintrospective\texperiential\timmersive\thuman\tstoryteller\tbuilder",
  ],
  "ls projects/ | head -4": [
    "ephemera/\tandWordsWillEchoInMySoul/\tnotesToSelf/\tpalimpsest/",
  ],
  ls: ["about.txt\ttags.txt\tprojects/"],
  help: [
    "available: whoami  cat about.txt  cat tags.txt  ls  ls projects/ | head -4  clear",
  ],
};

// Full auto-type sequence; first INITIAL_BATCH play on load,
// the rest resume after idle periods
const AUTO_SEQUENCE = ["whoami", "cat about.txt", "cat tags.txt", "ls projects/ | head -4"];
const INITIAL_BATCH = 2;
const IDLE_DELAY = 800;

const TYPE_SPEED = 35;
const OUTPUT_DELAY = 150;
const GROUP_DELAY = 400;

type Line = { type: "prompt" | "output"; text: string };

export default function TerminalPlayground() {
  const [lines, setLines] = useState<Line[]>([]);
  const [phase, setPhase] = useState<"typing" | "interactive">("typing");
  const [input, setInput] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextAutoRef = useRef(0);
  const inputValueRef = useRef("");
  const idleTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const typingCleanupRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(true);

  // Mount/unmount tracking
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimeout(idleTimerRef.current);
      typingCleanupRef.current?.();
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, phase]);

  // Focus input when interactive
  useEffect(() => {
    if (phase === "interactive") inputRef.current?.focus({ preventScroll: true });
  }, [phase]);

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  // --- Auto-type engine (uses refs, safe across renders) ---

  function typeCommands(commands: string[], onDone: () => void) {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    const steps: Line[] = [];
    for (const cmd of commands) {
      steps.push({ type: "prompt", text: `$ ${cmd}` });
      for (const line of RESPONSES[cmd] || []) {
        steps.push({ type: "output", text: line });
      }
    }

    let si = 0;
    let ci = 0;

    function tick() {
      if (cancelled || !mountedRef.current || si >= steps.length) {
        if (!cancelled && mountedRef.current) onDone();
        return;
      }

      const step = steps[si];

      if (step.type === "prompt") {
        if (ci === 0) {
          setLines((prev) => [...prev, { type: "prompt", text: "" }]);
        }
        if (ci < step.text.length) {
          ci++;
          setLines((prev) => {
            const next = [...prev];
            next[next.length - 1] = {
              type: "prompt",
              text: step.text.slice(0, ci),
            };
            return next;
          });
          timeout = setTimeout(tick, TYPE_SPEED);
        } else {
          ci = 0;
          si++;
          timeout = setTimeout(tick, OUTPUT_DELAY);
        }
      } else {
        setLines((prev) => [...prev, step]);
        si++;
        ci = 0;
        const nextIsPrompt =
          si < steps.length && steps[si].type === "prompt";
        timeout = setTimeout(tick, nextIsPrompt ? GROUP_DELAY : 80);
      }
    }

    // First command starts after a small delay; resumed ones after GROUP_DELAY
    const initialDelay = nextAutoRef.current <= INITIAL_BATCH ? 300 : GROUP_DELAY;
    timeout = setTimeout(tick, initialDelay);

    typingCleanupRef.current = () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }

  function startIdleTimer() {
    clearTimeout(idleTimerRef.current);
    if (nextAutoRef.current >= AUTO_SEQUENCE.length) return;

    idleTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      // Don't interrupt if user is mid-typing
      if (inputValueRef.current.trim() !== "") {
        startIdleTimer();
        return;
      }

      const cmd = AUTO_SEQUENCE[nextAutoRef.current];
      nextAutoRef.current++;
      setPhase("typing");
      typeCommands([cmd], () => {
        setPhase("interactive");
        startIdleTimer();
      });
    }, IDLE_DELAY);
  }

  // Initial auto-type on mount
  useEffect(() => {
    const initialCmds = AUTO_SEQUENCE.slice(0, INITIAL_BATCH);
    nextAutoRef.current = INITIAL_BATCH;

    typeCommands(initialCmds, () => {
      setPhase("interactive");
      startIdleTimer();
    });

    return () => {
      typingCleanupRef.current?.();
      clearTimeout(idleTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Interactive command handling ---

  function exec(cmd: string) {
    setLines((prev) => [...prev, { type: "prompt", text: `$ ${cmd}` }]);

    if (cmd === "clear") {
      setLines([]);
      return;
    }
    if (!cmd) return;

    const resp = RESPONSES[cmd];
    if (resp) {
      setLines((prev) => [
        ...prev,
        ...resp.map((t) => ({ type: "output" as const, text: t })),
      ]);
    } else {
      setLines((prev) => [
        ...prev,
        {
          type: "output",
          text: `${cmd.split(" ")[0]}: command not found. try 'help'`,
        },
      ]);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInput(val);
    inputValueRef.current = val;
    // Reset idle timer on every keystroke
    clearTimeout(idleTimerRef.current);
    startIdleTimer();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      const cmd = input.trim();
      setInput("");
      inputValueRef.current = "";
      if (cmd) {
        setHistory((prev) => [...prev, cmd]);
        setHistoryIndex(-1);
      }
      exec(cmd);
      clearTimeout(idleTimerRef.current);
      startIdleTimer();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const idx =
        historyIndex === -1
          ? history.length - 1
          : Math.max(0, historyIndex - 1);
      setHistoryIndex(idx);
      setInput(history[idx]);
      inputValueRef.current = history[idx];
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      const idx = historyIndex + 1;
      if (idx >= history.length) {
        setHistoryIndex(-1);
        setInput("");
        inputValueRef.current = "";
      } else {
        setHistoryIndex(idx);
        setInput(history[idx]);
        inputValueRef.current = history[idx];
      }
    }
  }

  return (
    <div
      className={styles.terminal}
      onClick={() => inputRef.current?.focus({ preventScroll: true })}
    >
      <div ref={scrollRef} className={styles.lines}>
        {lines.map((line, i) => (
          <div
            key={i}
            className={
              line.type === "prompt" ? styles.prompt : styles.output
            }
          >
            {line.text}
          </div>
        ))}
        {phase === "interactive" ? (
          <div className={styles.inputLine}>
            <span className={styles.promptPrefix}>$ </span>
            <span className={styles.inputDisplay}>{input}</span>
            <span
              className={`${styles.cursor} ${cursorVisible ? "" : styles.cursorHidden}`}
            >
              _
            </span>
            <input
              ref={inputRef}
              className={styles.hiddenInput}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
            />
          </div>
        ) : (
          <span
            className={`${styles.cursor} ${cursorVisible ? "" : styles.cursorHidden}`}
          >
            _
          </span>
        )}
      </div>
    </div>
  );
}
