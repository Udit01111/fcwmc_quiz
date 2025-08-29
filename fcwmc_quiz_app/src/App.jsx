import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Download, TimerReset, Shuffle, CheckCircle2, XCircle, Loader2, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * FCWMC Intensive MCQ Quiz
 */

const TOPICS = [
  "Wired vs Wireless",
  "Wireless Applications",
  "Bandwidth & Frequency",
  "Modulation Basics",
  "Amplitude Modulation (AM)",
  "Frequency Modulation (FM)",
  "Phase Modulation (PM)",
  "Digital Modulation",
  "PSK",
  "QAM",
  "OFDM/OFDMA & SC-FDMA",
  "RB/Frame Structure",
  "LTE Architecture & EPC",
  "Interfaces",
  "Bearers",
  "Initial Attach",
  "Protocol Stack",
  "eNodeB & MAC",
  "Scheduling/HARQ/LCP",
  "MIMO & CSI",
  "QoS/QCI",
  "3G→4G/5G Evolution",
  "3GPP Releases",
  "OFDMA vs TDMA/CDMA",
  "5G URLLC",
  "5G Security"
];

const DIFFICULTY = ["easy", "medium", "hard"];

// ---------- Question Bank ----------
const QBANK = [
  {
    id: 1,
    topic: "Wired vs Wireless",
    difficulty: "easy",
    lecture: "L1/L3",
    q: "Which medium typically offers <1 ms latency and high stability due to dedicated links?",
    options: ["Wi-Fi 6", "Cat6/Cat7 Ethernet", "4G LTE", "Bluetooth"],
    answer: 1,
    explanation: "Wired Ethernet (Cat6/Cat7) supports very low latency and stable performance per Lecture 1/3."
  },
  {
    id: 2,
    topic: "Wired vs Wireless",
    difficulty: "easy",
    lecture: "L1/L3",
    q: "Which is MORE vulnerable to eavesdropping without strong encryption?",
    options: ["Fiber", "Twisted pair", "Wireless LAN", "Coaxial"],
    answer: 2,
    explanation: "Wireless transmissions are in the open air and require encryption (e.g., WPA3)."
  },
  // … continue with the rest of your questions (3 → 70) …
];

// Utility: shuffle array
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Convert to CSV
function toCSV(rows) {
  const header = ["id","topic","difficulty","lecture","question","optA","optB","optC","optD","answerIndex","explanation"];
  const lines = [header.join(",")];
  for (const r of rows) {
    const safe = (s) => '"' + s.replaceAll('"', '""') + '"';
    lines.push([
      r.id,
      safe(r.topic),
      r.difficulty,
      safe(r.lecture),
      safe(r.q),
      safe(r.options[0]),
      safe(r.options[1]),
      safe(r.options[2]),
      safe(r.options[3]),
      r.answer,
      safe(r.explanation)
    ].join(","));
  }
  return lines.join("\n");
}

function download(filename, data, mime) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [modeExam, setModeExam] = useState(false);
  const [topic, setTopic] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [timerSecs, setTimerSecs] = useState(0);
  const [shuffled, setShuffled] = useState(true);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [finished, setFinished] = useState(false);
  const [remaining, setRemaining] = useState(0);

  const filtered = useMemo(() => {
    let items = [...QBANK];
    if (topic !== "All") items = items.filter(q => q.topic === topic);
    if (difficulty !== "All") items = items.filter(q => q.difficulty === difficulty);
    if (shuffled) items = shuffle(items);
    return items;
  }, [topic, difficulty, shuffled]);

  useEffect(() => {
    setIndex(0);
    setAnswers({});
    setRevealed({});
    setFinished(false);
  }, [filtered.length]);

  useEffect(() => {
    let t = null;
    if (started && timerSecs > 0 && !finished) {
      setRemaining(timerSecs);
      t = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(t);
            setFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => t && clearInterval(t);
  }, [started, timerSecs, finished]);

  const current = filtered[index];
  const total = filtered.length;
  const answeredCount = Object.values(answers).filter(v => v !== null && v !== undefined).length;
  const correctCount = filtered.reduce((acc, q) => acc + ((answers[q.id] === q.answer) ? 1 : 0), 0);

  function selectOption(qid, optIdx) {
    if (finished) return;
    setAnswers(a => ({ ...a, [qid]: optIdx }));
    if (!modeExam) setRevealed(r => ({ ...r, [qid]: true }));
  }

  function prevQ() { setIndex(i => Math.max(0, i - 1)); }
  function nextQ() { setIndex(i => Math.min(total - 1, i + 1)); }

  function submitExam() {
    setFinished(true);
    setRevealed(filtered.reduce((acc, q) => { acc[q.id] = true; return acc; }, {}));
  }

  function exportJSON() {
    download("FCWMC_quiz_bank.json", JSON.stringify(QBANK, null, 2), "application/json");
  }
  function exportCSV() {
    download("FCWMC_quiz_bank.csv", toCSV(QBANK), "text/csv");
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl font-bold">FCWMC Quiz</h1>
        {/* ...rest of your UI code from canvas (kept same, only removed types)... */}
      </div>
    </div>
  );
}

function QuestionCard({ q, chosen, reveal, onChoose }) {
  const status = reveal ? (chosen === q.answer ? "correct" : "incorrect") : chosen !== null ? "selected" : "idle";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-gray-500">{q.topic} · {q.difficulty} · {q.lecture}</div>
          <h2 className="text-lg font-semibold mt-1">{q.q}</h2>
        </div>
        {reveal && (chosen === q.answer ? <CheckCircle2 className="w-5 h-5 text-green-600"/> : <XCircle className="w-5 h-5 text-red-600"/>) }
      </div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {q.options.map((opt, i) => {
          const isCorrect = reveal && i === q.answer;
          const isChosen = chosen === i;
          const base = "w-full text-left px-3 py-2 rounded-xl border transition";
          const styles = !reveal
            ? (isChosen ? "bg-blue-50 border-blue-400" : "bg-white border-gray-200 hover:border-gray-400")
            : isCorrect
              ? "bg-green-50 border-green-500"
              : isChosen
                ? "bg-red-50 border-red-500"
                : "bg-white border-gray-200 opacity-70";
          return (
            <button key={i} className={`${base} ${styles}`} onClick={() => onChoose(i)}>
              <span className="mr-2 font-mono text-xs">{String.fromCharCode(65+i)}.</span>{opt}
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {reveal && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 text-sm text-gray-700">
            <div className="font-semibold mb-1">Explanation</div>
            <div>{q.explanation}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
