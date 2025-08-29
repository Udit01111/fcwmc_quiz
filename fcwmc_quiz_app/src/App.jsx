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
 *
 * Covers: Lectures 1–30+ (Wired vs Wireless, Applications, Bandwidth/Frequency/Data rate, Modulation (AM/FM/PM),
 * Digital modulation (ASK/FSK/PSK/QAM), OFDM/OFDMA/SC-FDMA, Resource blocks & frame, LTE architecture & EPC,
 * Interfaces (S1/S5/S8/S6a/X2/S11), Bearers, Initial Attach, Protocol Stack (PDCP/RLC/MAC/PHY + NAS/RRC),
 * eNodeB functions, Scheduling/HARQ/LCP, MAC CEs (BSR/SR/PHR), MIMO/CSI, QoS/QCI, 3G→4G→5G, 3GPP Releases,
 * OFDMA vs TDMA/CDMA, 5G URLLC, 5G Security.)
 *
 * Features: responsive UI, Practice vs Exam mode, topic filter, difficulty filter, shuffle, timer, per-question
 * explanations, review mode, progress bar, export JSON/CSV, print-friendly layout.
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
] as const;

const DIFFICULTY = ["easy", "medium", "hard"] as const;

// ---------- Question Bank ----------
// Each question has: id, topic, difficulty, lecture, q, options[4], answer, explanation

const QBANK: Array<{
  id: number;
  topic: typeof TOPICS[number];
  difficulty: typeof DIFFICULTY[number];
  lecture: string;
  q: string;
  options: string[];
  answer: number; // index 0..3
  explanation: string;
}> = [
  // Wired vs Wireless (Lecture 1/3)
  { id: 1, topic: "Wired vs Wireless", difficulty: "easy", lecture: "L1/L3", q: "Which medium typically offers <1 ms latency and high stability due to dedicated links?", options: ["Wi‑Fi 6", "Cat6/Cat7 Ethernet", "4G LTE", "Bluetooth"], answer: 1, explanation: "Wired Ethernet (Cat6/Cat7) supports very low latency and stable performance per Lecture 1/3." },
  { id: 2, topic: "Wired vs Wireless", difficulty: "easy", lecture: "L1/L3", q: "Which is MORE vulnerable to eavesdropping without strong encryption?", options: ["Fiber", "Twisted pair", "Wireless LAN", "Coaxial"], answer: 2, explanation: "Wireless transmissions are in the open air and require encryption (e.g., WPA3)." },
  { id: 3, topic: "Wired vs Wireless", difficulty: "medium", lecture: "L1", q: "Which statement about mobility is TRUE?", options: ["Wired networks offer higher mobility than wireless.", "Wireless networks provide high mobility with no physical cabling.", "Both require physical tethers.", "Mobility is independent of medium."], answer: 1, explanation: "Wireless eliminates physical cabling, enabling high mobility (Lecture 1)." },
  { id: 4, topic: "Wired vs Wireless", difficulty: "medium", lecture: "L1", q: "Which historically enabled the shift from wired to modern wireless systems?", options: ["Morse code in 1990s", "Discovery of radio waves & ALOHAnet", "Twisted pair Category 1", "Analog PBX"], answer: 1, explanation: "Radio waves (1888) and ALOHAnet (1970s) were key milestones (Lecture 1)." },

  // Wireless Applications (Lecture 2/4)
  { id: 5, topic: "Wireless Applications", difficulty: "easy", lecture: "L2/L4", q: "Which technology connects peripherals over short distances for audio streaming and input devices?", options: ["Zigbee", "Bluetooth", "Wi‑Fi 6E", "GPS"], answer: 1, explanation: "Bluetooth supports short‑range peripherals and audio (Lecture 2/4)." },
  { id: 6, topic: "Wireless Applications", difficulty: "easy", lecture: "L2/L4", q: "Which system provides positioning and navigation via satellites?", options: ["RFID", "GPS", "NFC", "Z-Wave"], answer: 1, explanation: "GPS provides global positioning (Lecture 2/4)." },
  { id: 7, topic: "Wireless Applications", difficulty: "medium", lecture: "L2/L4", q: "Smart homes commonly use which protocols for sensors and automation?", options: ["Wi‑Fi, Zigbee, Bluetooth", "Ethernet, Token Ring", "DOCSIS, DSL", "USB, HDMI"], answer: 0, explanation: "Wi‑Fi/Zigbee/Bluetooth are typical (Lecture 2/4)." },

  // Bandwidth & Frequency (Lecture 5/6)
  { id: 8, topic: "Bandwidth & Frequency", difficulty: "easy", lecture: "L5", q: "Bandwidth primarily determines which aspect?", options: ["Propagation delay", "Noise figure", "Max data capacity", "Antenna aperture"], answer: 2, explanation: "Bandwidth sets maximum data transmission capacity (Lecture 5)." },
  { id: 9, topic: "Bandwidth & Frequency", difficulty: "medium", lecture: "L6", q: "One reason for using a high‑frequency carrier for a low‑frequency message is:", options: ["To require larger antennas", "To avoid modulation", "To use smaller practical antennas", "To eliminate noise entirely"], answer: 2, explanation: "Higher carrier frequency allows smaller antennas (Lecture 6)." },
  { id: 10, topic: "Bandwidth & Frequency", difficulty: "medium", lecture: "L5", q: "Frequency reuse in cellular systems means:", options: ["Adjacent cells share identical frequencies", "Non‑adjacent cells reuse the same channels", "Each cell has unique spectrum", "Frequencies change randomly per call"], answer: 1, explanation: "Reuse in non‑adjacent cells increases capacity (Lecture 5)." },

  // Modulation Basics (Lecture 6)
  { id: 11, topic: "Modulation Basics", difficulty: "easy", lecture: "L6", q: "Modulation is used primarily to:", options: ["Reduce file size", "Embed a message onto a carrier for transmission", "Encrypt data", "Correct errors"], answer: 1, explanation: "Core purpose is to superimpose the message on a high‑frequency carrier (Lecture 6)." },
  { id: 12, topic: "Modulation Basics", difficulty: "medium", lecture: "L6", q: "Which pair correctly matches analog vs digital modulation?", options: ["AM/QPSK", "FSK/AM", "PM/ASK", "AM/FM/PM vs ASK/FSK/PSK"], answer: 3, explanation: "Analog: AM/FM/PM; Digital: ASK/FSK/PSK (Lecture 6)." },

  // AM (Lecture 6)
  { id: 13, topic: "Amplitude Modulation (AM)", difficulty: "medium", lecture: "L6", q: "In AM, the modulation index μ should typically satisfy:", options: ["μ > 1 for linearity", "μ = 0 for max bandwidth", "μ ≤ 1 to avoid overmodulation distortion", "μ unrelated to distortion"], answer: 2, explanation: "μ ≤ 1 avoids envelope distortion (Lecture 6)." },
  { id: 14, topic: "Amplitude Modulation (AM)", difficulty: "hard", lecture: "L6", q: "The AM signal s(t)=Ac[1+μ cos(2πf_m t)] cos(2πf_c t) contains frequency components at:", options: ["f_c only", "f_m only", "f_c ± f_m and f_c", "2f_c ± f_m"], answer: 2, explanation: "AM spectrum has carrier at f_c and sidebands at f_c±f_m (Lecture 6)." },

  // FM (Lecture 8)
  { id: 15, topic: "Frequency Modulation (FM)", difficulty: "easy", lecture: "L8", q: "Carson’s Rule for FM approximates bandwidth as:", options: ["BW = 2(Δf + f_m)", "BW = f_c/2", "BW = Δf − f_m", "BW = 2πf_m"], answer: 0, explanation: "Carson’s Rule BW≈2(Δf+f_m) (Lecture 8)." },
  { id: 16, topic: "Frequency Modulation (FM)", difficulty: "medium", lecture: "L8", q: "FM’s key advantage over AM in noisy channels is:", options: ["Lower required bandwidth", "Superior noise immunity via frequency deviation", "Simpler receivers", "No need for high SNR"], answer: 1, explanation: "FM offers better noise resistance (Lecture 8)." },

  // PM (Lecture 8)
  { id: 17, topic: "Phase Modulation (PM)", difficulty: "medium", lecture: "L8", q: "In PM, the carrier’s _____ varies with the message signal amplitude:", options: ["amplitude", "phase", "frequency only", "envelope only"], answer: 1, explanation: "PM varies phase proportional to message amplitude (Lecture 8)." },

  // Digital Modulation (Lecture 8)
  { id: 18, topic: "Digital Modulation", difficulty: "easy", lecture: "L8", q: "Which digital scheme changes frequency between two values for bits?", options: ["ASK", "FSK", "PSK", "OFDM"], answer: 1, explanation: "FSK uses frequency shifts (Lecture 8)." },
  { id: 19, topic: "Digital Modulation", difficulty: "medium", lecture: "L8", q: "Which reason motivates digital modulation in wireless?", options: ["Larger antennas", "Worse BER performance", "Higher spectral efficiency and FEC support", "Eliminates need for encryption"], answer: 2, explanation: "Digital schemes enable efficiency, FEC, and robustness (Lecture 8)." },

  // PSK (Lecture 9)
  { id: 20, topic: "PSK", difficulty: "easy", lecture: "L9", q: "QPSK carries how many bits per symbol?", options: ["1", "2", "3", "4"], answer: 1, explanation: "QPSK = 2 bits/symbol (Lecture 9)." },
  { id: 21, topic: "PSK", difficulty: "medium", lecture: "L9", q: "BPSK is preferred when:", options: ["Very high SNR and bandwidth abundant", "Low SNR / robust links are needed", "Constellation needs 8 points", "Only analog voice is sent"], answer: 1, explanation: "BPSK maximizes robustness at low SNR (Lecture 9)." },

  // QAM (Lecture 10)
  { id: 22, topic: "QAM", difficulty: "easy", lecture: "L10", q: "16‑QAM transmits how many bits per symbol?", options: ["2", "3", "4", "8"], answer: 2, explanation: "16‑QAM has 16 symbols → 4 bits/symbol (Lecture 10)." },
  { id: 23, topic: "QAM", difficulty: "medium", lecture: "L10", q: "As QAM order increases (e.g., 64→256), which is TRUE?", options: ["Required SNR decreases", "Symbol spacing increases", "Data rate potential increases but noise resilience drops", "BER improves at same SNR"], answer: 2, explanation: "Higher‑order QAM raises throughput but needs higher SNR (Lecture 10)." },
  { id: 24, topic: "QAM", difficulty: "medium", lecture: "L10", q: "Which network generations commonly use 64‑QAM/256‑QAM?", options: ["2G only", "3G only", "4G/5G", "Wi‑Fi b only"], answer: 2, explanation: "LTE/5G employ high‑order QAM (Lecture 10)." },

  // OFDM/OFDMA & SC-FDMA (Lecture 12/29)
  { id: 25, topic: "OFDM/OFDMA & SC-FDMA", difficulty: "easy", lecture: "L12/L29", q: "In LTE downlink, the multiple access scheme is:", options: ["CDMA", "TDMA", "OFDMA", "SC‑FDMA"], answer: 2, explanation: "LTE DL uses OFDMA (Lecture 29)." },
  { id: 26, topic: "OFDM/OFDMA & SC-FDMA", difficulty: "medium", lecture: "L29", q: "Why does LTE uplink use SC‑FDMA?", options: ["To increase PAPR", "To simplify MIMO", "To reduce UE power via lower PAPR", "Because orthogonality is unnecessary"], answer: 2, explanation: "SC‑FDMA lowers PAPR improving UE battery life (Lecture 29)." },
  { id: 27, topic: "OFDM/OFDMA & SC-FDMA", difficulty: "medium", lecture: "L12", q: "Typical LTE subcarrier spacing is:", options: ["15 kHz", "150 kHz", "7.5 kHz", "1 kHz"], answer: 0, explanation: "LTE DL uses 15 kHz spacing (Lecture 29/12)." },
  { id: 28, topic: "OFDM/OFDMA & SC-FDMA", difficulty: "medium", lecture: "L12", q: "A cyclic prefix in OFDM helps primarily with:", options: ["Carrier frequency offset", "Phase noise only", "Inter‑symbol interference from multipath", "Encryption"], answer: 2, explanation: "CP mitigates ISI (Lecture 12/29)." },

  // RB/Frame (Lecture 29)
  { id: 29, topic: "RB/Frame Structure", difficulty: "easy", lecture: "L29", q: "One LTE Resource Block spans:", options: ["12 subcarriers × 0.5 ms", "24 subcarriers × 1 ms", "6 subcarriers × 0.25 ms", "1 subcarrier × 7 ms"], answer: 0, explanation: "RB = 12 subcarriers in freq (180 kHz) and 0.5 ms in time (Lecture 29)." },
  { id: 30, topic: "RB/Frame Structure", difficulty: "medium", lecture: "L29", q: "The LTE Transmission Time Interval (TTI) used for scheduling is:", options: ["0.125 ms", "0.5 ms", "1 ms", "10 ms"], answer: 2, explanation: "Scheduling occurs every 1 ms (Lecture 29)." },

  // LTE Architecture & EPC (Lecture 17/18/30)
  { id: 31, topic: "LTE Architecture & EPC", difficulty: "easy", lecture: "L17/L18", q: "Which node authenticates the UE and manages mobility (TAU)?", options: ["SGW", "MME", "PGW", "HSS"], answer: 1, explanation: "MME handles auth/mobility and NAS (Lecture 18)." },
  { id: 32, topic: "LTE Architecture & EPC", difficulty: "easy", lecture: "L17", q: "Which gateway connects to external networks and allocates IP?", options: ["SGW", "PGW", "HSS", "MME"], answer: 1, explanation: "PGW allocates IP and enforces policy (Lecture 18/17)." },
  { id: 33, topic: "LTE Architecture & EPC", difficulty: "medium", lecture: "L17/L30", q: "User‑plane tunneling between eNodeB and SGW uses:", options: ["SCTP", "GTP‑U on S1‑U", "Diameter", "HTTP/2"], answer: 1, explanation: "S1‑U carries GTP‑U (Lecture 17/30)." },

  // Interfaces (Lecture 17/18)
  { id: 34, topic: "Interfaces", difficulty: "medium", lecture: "L17/L18", q: "Which correctly maps interface → purpose?", options: ["S6a: eNodeB–PGW user plane", "X2: eNodeB–eNodeB handover/load balance", "S5/S8: MME–HSS signaling", "S1‑MME: user plane"], answer: 1, explanation: "X2 connects eNodeBs for HO/coordination; S6a is MME–HSS; S1‑MME is control plane (Lecture 17/18)." },
  { id: 35, topic: "Interfaces", difficulty: "medium", lecture: "L18", q: "S11 connects which nodes for bearer control?", options: ["MME–SGW", "SGW–PGW", "eNodeB–MME", "HSS–MME"], answer: 0, explanation: "S11 is MME↔SGW GTP‑C (Lecture 18)." },

  // Bearers (Lecture 18)
  { id: 36, topic: "Bearers", difficulty: "easy", lecture: "L18", q: "Default bearer characteristics include:", options: ["GBR, unique IP", "Non‑GBR, assigned at attach", "No IP address", "Only for VoLTE"], answer: 1, explanation: "Default is non‑GBR, created at attach, provides IP (Lecture 18)." },
  { id: 37, topic: "Bearers", difficulty: "medium", lecture: "L18", q: "Dedicated bearer for VoLTE typically is:", options: ["Non‑GBR QCI 9", "GBR (QCI 1–4)", "Control‑plane only", "Uses S1‑MME user plane"], answer: 1, explanation: "VoLTE requires GBR dedicated bearer (Lecture 18)." },

  // Initial Attach (Lecture 23)
  { id: 38, topic: "Initial Attach", difficulty: "medium", lecture: "L23", q: "During initial attach, who allocates the UE IP address?", options: ["MME", "eNodeB", "PGW", "HSS"], answer: 2, explanation: "PGW allocates IP as part of Create Session (Lecture 23)." },
  { id: 39, topic: "Initial Attach", difficulty: "medium", lecture: "L23", q: "Which order is MOST accurate?", options: ["Attach Req → Handover → Auth", "Cell search → RRC setup → Attach Request", "IP alloc → Random Access → TAU", "SR → BSR → Attach"], answer: 1, explanation: "Cell search/sync, RRC connection, then Attach Request (Lecture 23)." },

  // Protocol Stack (Lecture 14/30)
  { id: 40, topic: "Protocol Stack", difficulty: "medium", lecture: "L14/L30", q: "Which layer provides header compression and ciphering?", options: ["PDCP", "RLC", "MAC", "PHY"], answer: 0, explanation: "PDCP does ROHC + security (Lecture 14/30)." },
  { id: 41, topic: "Protocol Stack", difficulty: "medium", lecture: "L14/L30", q: "RLC AM provides:", options: ["Only segmentation", "ARQ with retransmissions", "HARQ", "Modulation selection"], answer: 1, explanation: "RLC AM has ARQ; HARQ is in MAC (Lecture 14/30)." },
  { id: 42, topic: "Protocol Stack", difficulty: "medium", lecture: "L14/L30", q: "Control‑plane signaling between UE and eNodeB uses:", options: ["NAS", "RRC", "GTP‑C", "S1‑AP at UE"], answer: 1, explanation: "RRC is UE↔eNodeB; NAS is UE↔MME (Lecture 30/14)." },

  // eNodeB & MAC / Scheduling components (Lecture 19/29/30)
  { id: 43, topic: "eNodeB & MAC", difficulty: "medium", lecture: "L19/L29", q: "eNodeB handles which RRM function?", options: ["IP address assignment", "Random Access and scheduling RBs", "Subscriber database", "Diameter routing"], answer: 1, explanation: "eNodeB performs RA, scheduling, power control, etc. (Lecture 19)." },
  { id: 44, topic: "Scheduling/HARQ/LCP", difficulty: "medium", lecture: "L29", q: "CQI primarily informs the eNodeB about:", options: ["UE battery level", "Channel quality to pick MCS", "IMSI status", "TA list"], answer: 1, explanation: "CQI guides modulation/coding (Lecture 29/MIMO&CSI)." },
  { id: 45, topic: "Scheduling/HARQ/LCP", difficulty: "medium", lecture: "L29/30", q: "HARQ in LTE is:", options: ["ARQ at PDCP", "Stop‑and‑wait with soft combining at MAC", "Link adaptation at PHY only", "Pure FEC with no retransmission"], answer: 1, explanation: "LTE uses MAC‑layer HARQ with soft combining (Lecture 29/30)." },
  { id: 46, topic: "Scheduling/HARQ/LCP", difficulty: "medium", lecture: "L29", q: "Logical Channel Prioritization uses which parameters?", options: ["CIDR and TTL", "PBR & BSD with priorities", "SINR & RSRP only", "EIRP & EVM"], answer: 1, explanation: "LCP uses Priority, PBR, BSD (Lecture MAC/L29)." },
  { id: 47, topic: "Scheduling/HARQ/LCP", difficulty: "medium", lecture: "L29", q: "Which MAC Control Elements help UL resource requests and buffer status?", options: ["SR & BSR", "PMI & RI", "ROHC & DRX", "S1‑AP & X2‑AP"], answer: 0, explanation: "SR requests UL grants; BSR reports buffer size; PHR reports power headroom (Lecture 29)." },

  // MIMO & CSI (Lecture 29/4)
  { id: 48, topic: "MIMO & CSI", difficulty: "medium", lecture: "L29", q: "RI in CSI feedback indicates:", options: ["HARQ redundancy version", "Number of spatial layers (rank)", "Paging cycle length", "RB count"], answer: 1, explanation: "RI = Rank Indicator (Lecture MIMO/CSI)." },
  { id: 49, topic: "MIMO & CSI", difficulty: "medium", lecture: "L29", q: "Alamouti is a:", options: ["Channel code", "Diversity scheme for transmit antennas", "MAC scheduler", "QAM mapper"], answer: 1, explanation: "Space‑time block coding for diversity (Lecture 29)." },

  // QoS/QCI (Lecture 18/30)
  { id: 50, topic: "QoS/QCI", difficulty: "medium", lecture: "L18/L30", q: "VoLTE typically maps to which QCI?", options: ["QCI 1 (GBR low‑latency voice)", "QCI 7", "QCI 9 only", "QCI 5 IMS signaling only"], answer: 0, explanation: "VoLTE uses GBR (often QCI 1) (Lecture 18)." },
  { id: 51, topic: "QoS/QCI", difficulty: "medium", lecture: "L30", q: "Which plane carries user data packets?", options: ["Control plane", "User plane", "NAS", "RRC"], answer: 1, explanation: "User plane transports user IP payload (Lecture 30)." },

  // 3G→4G/5G Evolution + 3GPP Releases (Lecture 2/3/17)
  { id: 52, topic: "3G→4G/5G Evolution", difficulty: "easy", lecture: "L2/L17", q: "LTE introduced which architectural shift?", options: ["Circuit‑switched core", "All‑IP Evolved Packet Core", "Analog radio access", "No MIMO support"], answer: 1, explanation: "LTE EPC is all‑IP (Lecture 17)." },
  { id: 53, topic: "3GPP Releases", difficulty: "medium", lecture: "L2", q: "Release 8 introduced:", options: ["UMTS WCDMA", "LTE initial (≈300 Mbps DL)", "5G‑NR NSA", "5G‑Advanced"], answer: 1, explanation: "Rel‑8 launched LTE; Rel‑99 was UMTS; Rel‑15 NR; Rel‑18 5G‑Advanced (Lecture 2)." },
  { id: 54, topic: "3GPP Releases", difficulty: "medium", lecture: "L2", q: "Release 10 is known for:", options: ["LTE‑Advanced with carrier aggregation", "IMS inception", "NB‑IoT", "GSM introduction"], answer: 0, explanation: "Rel‑10 = LTE‑Advanced and CA (Lecture 2)." },

  // OFDMA vs TDMA/CDMA (Lecture 12)
  { id: 55, topic: "OFDMA vs TDMA/CDMA", difficulty: "medium", lecture: "L12", q: "A key advantage of OFDMA over CDMA is:", options: ["Higher near‑far problem", "Lower spectral efficiency", "Orthogonal subcarriers reduce mutual interference", "Requires guard bands between subcarriers"], answer: 2, explanation: "Orthogonality lowers interference; CDMA has near‑far issues (Lecture 12)." },

  // 5G URLLC (Lecture 44/URLLC section)
  { id: 56, topic: "5G URLLC", difficulty: "medium", lecture: "L44", q: "URLLC targets ~1 ms latency using which enablers?", options: ["Long TTIs and no retransmission", "Fast HARQ and short TTI", "Only MIMO", "Only carrier aggregation"], answer: 1, explanation: "Fast HARQ + short TTI among enablers (Lecture 44/URLLC)." },
  { id: 57, topic: "5G URLLC", difficulty: "medium", lecture: "L44", q: "SDN/NFV help URLLC by:", options: ["Increasing paging delay", "Virtualizing and dynamically routing to minimize latency", "Eliminating encryption", "Removing core user plane"], answer: 1, explanation: "SDN/NFV enable flexible low‑latency paths (Lecture 44)." },

  // 5G Security (Lecture 44 Security)
  { id: 58, topic: "5G Security", difficulty: "medium", lecture: "L44 (Security)", q: "5G conceals permanent IDs using:", options: ["IMSI in cleartext", "GUTI without cipher", "SUCI (encrypted SUPI)", "MAC address"], answer: 2, explanation: "5G encrypts the subscriber identifier as SUCI (Lecture 44)." },
  { id: 59, topic: "5G Security", difficulty: "medium", lecture: "L44 (Security)", q: "Mutual authentication in 5G is provided by:", options: ["5G‑AKA", "PAP", "WEP", "RADIUS only"], answer: 0, explanation: "5G‑AKA authenticates UE and network (Lecture 44)." },

  // More LTE PHY/MCS edge cases
  { id: 60, topic: "OFDM/OFDMA & SC-FDMA", difficulty: "medium", lecture: "L29", q: "Given SNR > 25 dB, LTE typically selects:", options: ["QPSK", "16‑QAM", "64‑QAM", "BPSK"], answer: 2, explanation: "64‑QAM is used at high SNR for peak rates (Lecture 29)." },

  // Add a few hard numericals/concepts
  { id: 61, topic: "Frequency Modulation (FM)", difficulty: "hard", lecture: "L8", q: "For FM with Δf=75 kHz and f_m(max)=15 kHz, Carson’s Rule gives BW ≈:", options: ["90 kHz", "120 kHz", "150 kHz", "180 kHz"], answer: 3, explanation: "BW≈2(Δf+f_m)=2(75+15)=180 kHz (Lecture 8)." },
  { id: 62, topic: "RB/Frame Structure", difficulty: "hard", lecture: "L29", q: "How many RBs in a 20 MHz LTE DL channel (normal CP)?", options: ["50", "75", "100", "200"], answer: 2, explanation: "Nominally 100 RBs (≈18 MHz usable) (Lecture 29)." },
  { id: 63, topic: "Protocol Stack", difficulty: "hard", lecture: "L30", q: "Map correctly: UE↔MME signaling protocol is:", options: ["RRC", "NAS", "S1‑AP", "GTP‑U"], answer: 1, explanation: "NAS runs UE↔MME over the control plane (Lecture 30)." },
  { id: 64, topic: "Interfaces", difficulty: "hard", lecture: "L17/L18", q: "Which is the user‑plane tunnel between SGW and PGW?", options: ["GTP‑U over S5/S8", "SCTP over S1‑MME", "GTP‑C over S11", "Diameter over S6a"], answer: 0, explanation: "S5/S8 carry GTP‑U for user plane; GTP‑C for control (Lecture 18)." },
  { id: 65, topic: "Scheduling/HARQ/LCP", difficulty: "hard", lecture: "L29", q: "An SR is sent when:", options: ["UE has UL data but no grant", "RB mapping fails", "CQI is low", "DRX disabled"], answer: 0, explanation: "Scheduling Request asks for UL resources when UE can’t piggyback BSR (Lecture 29)." },
  { id: 66, topic: "MIMO & CSI", difficulty: "hard", lecture: "L29", q: "PMI reports:", options: ["Preferred precoding/beamforming matrix", "Packet delay budget", "Paging cycle", "HARQ ACK"], answer: 0, explanation: "PMI = Precoding Matrix Indicator (Lecture 29)." },
  { id: 67, topic: "LTE Architecture & EPC", difficulty: "hard", lecture: "L17/L18", q: "Which component stores subscriber profiles and auth vectors?", options: ["HSS", "MME", "SGW", "PCRF only"], answer: 0, explanation: "HSS is the subscriber database and auth source (Lecture 18)." },
  { id: 68, topic: "3G→4G/5G Evolution", difficulty: "medium", lecture: "L2", q: "Key limitations of 3G that drove LTE adoption included:", options: ["Ultra‑low latency and high mmWave bandwidth", "Limited speed/latency and scalability", "Excessive spectral efficiency", "All‑IP core availability"], answer: 1, explanation: "3G had speed/latency/scalability limits (Lecture 2)." },
  { id: 69, topic: "OFDMA vs TDMA/CDMA", difficulty: "medium", lecture: "L12", q: "Compared to TDMA, OFDMA’s resource division is:", options: ["Time only", "Frequency only", "Code only", "Time and frequency (subcarriers)"], answer: 3, explanation: "OFDMA splits by time and frequency (Lecture 12)." },
  { id: 70, topic: "QoS/QCI", difficulty: "hard", lecture: "L18", q: "Which is TRUE about dedicated bearers?", options: ["Always non‑GBR", "Share IP with default bearer", "Assigned only at attach", "Used only for SMS"], answer: 1, explanation: "Dedicated bearers link to the default and share IP (Lecture 18)." },
];

// Utility: shuffle array
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Convert to CSV / JSON strings
function toCSV(rows: typeof QBANK) {
  const header = ["id","topic","difficulty","lecture","question","optA","optB","optC","optD","answerIndex","explanation"]; 
  const lines = [header.join(",")];
  for (const r of rows) {
    const safe = (s: string) => '"' + s.replaceAll('"', '""') + '"';
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

function download(filename: string, data: string, mime: string) {
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
  const [modeExam, setModeExam] = useState(false); // false = Practice (instant feedback), true = Exam (feedback at end)
  const [topic, setTopic] = useState<string>("All");
  const [difficulty, setDifficulty] = useState<string>("All");
  const [timerSecs, setTimerSecs] = useState<number>(0); // 0 = no timer
  const [shuffled, setShuffled] = useState<boolean>(true);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState(false);
  const [remaining, setRemaining] = useState<number>(0);

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
    let t: any = null;
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

  function selectOption(qid: number, optIdx: number) {
    if (finished) return;
    setAnswers(a => ({ ...a, [qid]: optIdx }));
    if (!modeExam) setRevealed(r => ({ ...r, [qid]: true }));
  }

  function prevQ() { setIndex(i => Math.max(0, i - 1)); }
  function nextQ() { setIndex(i => Math.min(total - 1, i + 1)); }

  function submitExam() {
    setFinished(true);
    setRevealed(filtered.reduce((acc, q) => { acc[q.id] = true; return acc; }, {} as Record<number, boolean>));
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
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold">FCWMC — Intensive Interactive MCQ Quiz</h1>
            <p className="text-sm text-gray-600">Practice mode shows instant feedback. Exam mode hides answers until you submit. Fully responsive.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select onValueChange={setTopic}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent className="max-h-72 overflow-auto">
                <SelectItem value="All">All Topics</SelectItem>
                {TOPICS.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setDifficulty}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Levels</SelectItem>
                {DIFFICULTY.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm">
              <Switch checked={modeExam} onCheckedChange={setModeExam} />
              <span className="text-sm">Exam mode</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm">
              <Shuffle className="w-4 h-4" />
              <span className="text-sm">Shuffle</span>
              <Switch checked={shuffled} onCheckedChange={setShuffled} />
            </div>
          </div>
        </header>

        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <Card className="sm:col-span-2">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm">
                  <TimerReset className="w-4 h-4" />
                  <span className="text-sm">Timer (min):</span>
                  <Input type="number" min={0} placeholder="0 = no timer" className="w-24"
                    onChange={(e) => setTimerSecs(Number(e.target.value || 0) * 60)} />
                </div>
                <Button onClick={() => setStarted(true)} className="rounded-2xl">Start</Button>
                <Button variant="secondary" onClick={() => { setStarted(false); setFinished(false); setAnswers({}); setRevealed({}); setIndex(0); }} className="rounded-2xl">Reset</Button>
                <Button variant="outline" onClick={exportJSON} className="rounded-2xl"><Download className="w-4 h-4 mr-1"/>Export JSON</Button>
                <Button variant="outline" onClick={exportCSV} className="rounded-2xl"><Download className="w-4 h-4 mr-1"/>Export CSV</Button>
                <div className="ml-auto text-sm text-gray-600">{topic === "All" ? "All Topics" : topic} · {difficulty === "All" ? "All Levels" : difficulty}</div>
              </div>

              <div className="flex items-center gap-3">
                <Progress value={total ? (100 * (answeredCount / total)) : 0} className="h-2" />
                <div className="text-sm text-gray-700">{answeredCount}/{total} answered</div>
              </div>

              {!started ? (
                <div className="text-sm text-gray-700">Select filters, set timer (optional), then press <span className="font-semibold">Start</span>. Use <span className="font-semibold">Exam mode</span> for a timed mock test and print the page to save as PDF.</div>
              ) : total === 0 ? (
                <div className="flex items-center gap-2 text-gray-600"><Loader2 className="w-4 h-4 animate-spin"/>No questions for the selected filters.</div>
              ) : (
                <>
                  {timerSecs > 0 && (
                    <div className={`text-sm font-semibold ${remaining <= 15 ? 'text-red-600' : 'text-gray-700'}`}>Time left: {Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')}</div>
                  )}
                  <QuestionCard
                    key={current?.id}
                    q={current}
                    chosen={answers[current?.id] ?? null}
                    reveal={!!revealed[current?.id]}
                    onChoose={(opt) => selectOption(current.id, opt)}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={prevQ} disabled={index===0} className="rounded-2xl">Prev</Button>
                    <Button onClick={nextQ} disabled={index===total-1} className="rounded-2xl">Next</Button>
                    {!modeExam && (
                      <Button variant="outline" onClick={() => setRevealed(r => ({ ...r, [current.id]: true }))} className="rounded-2xl">Reveal</Button>
                    )}
                    {modeExam && !finished && (
                      <Button variant="destructive" onClick={submitExam} className="rounded-2xl">Submit Exam</Button>
                    )}
                    <div className="ml-auto text-sm text-gray-600">Question {index+1} of {total}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm"><Layers className="w-4 h-4"/>Quiz Stats</div>
              <div className="text-3xl font-semibold">{correctCount} / {total}</div>
              <div className="text-sm text-gray-600">Correct · total</div>
              <div className="text-sm text-gray-700">Mode: {modeExam ? 'Exam' : 'Practice'}</div>
              <div className="text-sm text-gray-700">Filters: {topic==='All' ? 'All' : topic}, {difficulty==='All' ? 'All' : difficulty}</div>
              {finished && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold">Exam finished!</div>
                  <Button variant="outline" onClick={() => window.print()} className="rounded-2xl">Print / Save as PDF</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <footer className="text-xs text-gray-500 py-4">
          Tip: Use Export buttons to get a JSON/CSV of the same question bank for practice in other tools. You can also print this page to a PDF for offline drills.
        </footer>
      </div>
    </div>
  );
}

function QuestionCard({ q, chosen, reveal, onChoose }: { q: typeof QBANK[number]; chosen: number | null; reveal: boolean; onChoose: (idx: number) => void; }) {
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
