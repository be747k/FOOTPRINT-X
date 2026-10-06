import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Terminal,
  Code,
  FileText,
  Play,
  RotateCw,
  ExternalLink,
  HelpCircle,
  Award,
} from 'lucide-react';
import { LAB_EXPERIMENTS } from '../data/labCurriculum';
import { FullScanResult } from '../types/osint';

interface LabMappingViewProps {
  scanResult: FullScanResult | null;
  onExecuteExpScan: (expNum: number) => void;
  isScanning: boolean;
  onOpenReportModal: () => void;
}

export const LabMappingView: React.FC<LabMappingViewProps> = ({
  scanResult,
  onExecuteExpScan,
  isScanning,
  onOpenReportModal,
}) => {
  const [selectedExpId, setSelectedExpId] = useState<string>('EXP-01');
  const [activeTab, setActiveTab] = useState<'syllabus' | 'runner' | 'viva'>('syllabus');

  const selectedExp = LAB_EXPERIMENTS.find((e) => e.id === selectedExpId) || LAB_EXPERIMENTS[0];

  const vivaQuestions = [
    {
      q: 'What is the fundamental difference between passive and active reconnaissance?',
      a: 'Passive reconnaissance gathers intelligence without directly probing or sending suspicious packets to the target system (e.g., DNS queries, WHOIS, Certificate Transparency logs), evading Network Intrusion Detection Systems (NIDS). Active reconnaissance interacts directly with target ports and daemons.',
    },
    {
      q: 'How does CRT.sh uncover subdomains without brute-force wordlists?',
      a: 'CRT.sh monitors public Certificate Transparency (CT) logs, which are cryptographic append-only ledgers mandated by browsers. Whenever a Certificate Authority (CA) issues an SSL/TLS certificate for a domain or its subdomains, it is recorded publicly.',
    },
    {
      q: 'Why is leaking the "Server" or "X-Powered-By" HTTP response header dangerous?',
      a: 'Disclosing precise server daemons and software versions (e.g., Apache/2.4.49 or PHP/7.4) allows attackers to query national vulnerability databases (CVEs) and Exploit-DB for known unpatched remote code execution vulnerabilities.',
    },
    {
      q: 'What does the HTTP Strict Transport Security (HSTS) header prevent?',
      a: 'HSTS instructs browsers to only interact with the domain over secure HTTPS connections, preventing SSL-stripping Man-in-the-Middle (MitM) attacks and cookie hijacking on insecure HTTP redirects.',
    },
    {
      q: 'How is the Exposure Risk Score calculated in FOOTPRINT-X?',
      a: 'The Risk Engine uses a CVSS-weighted mathematical model starting with a baseline score and adding penalties for missing security headers (-15 for HSTS/CSP, -10 for XFO), server version leaks (-12), sensitive CT subdomains (-18), and social identity correlations.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              <h2 className="font-syne font-bold text-lg text-white">
                ACADEMIC LABORATORY MAPPING (IoTCSBCL704)
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Cyber Security & Forensic Analysis Laboratory Syllabus Compliance & Verification Matrix.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('syllabus')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'syllabus'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              Curriculum Matrix
            </button>
            <button
              onClick={() => setActiveTab('runner')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'runner'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              Interactive Lab Mission
            </button>
            <button
              onClick={() => setActiveTab('viva')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'viva'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              Viva Voce Defense
            </button>
          </div>
        </div>

        {/* Course Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 text-xs font-mono">
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 uppercase text-[10px]">Course Code</span>
            <div className="text-sm font-bold text-white mt-0.5">IoTCSBCL704</div>
          </div>
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 uppercase text-[10px]">Course Title</span>
            <div className="text-xs font-bold text-indigo-300 mt-0.5 truncate">
              Cyber Security & Forensics Lab
            </div>
          </div>
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 uppercase text-[10px]">Covered Experiments</span>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">
              Exp 1, 2, 5, 6, 7, 8, 12
            </div>
          </div>
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 uppercase text-[10px]">Laboratory Evaluation</span>
            <div className="text-sm font-bold text-cyan-400 mt-0.5">Continuous & Formal</div>
          </div>
        </div>
      </div>

      {/* VIEW 1: CURRICULUM SYLLABUS MAPPING */}
      {activeTab === 'syllabus' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Experiment Selector */}
          <div className="lg:col-span-4 space-y-2">
            <h3 className="font-syne font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">
              Select Experiment from Syllabus:
            </h3>
            {LAB_EXPERIMENTS.map((exp) => (
              <button
                key={exp.id}
                onClick={() => setSelectedExpId(exp.id)}
                className={`w-full p-3.5 rounded-lg border text-left transition-all ${
                  selectedExpId === exp.id
                    ? 'bg-indigo-500/15 border-indigo-500/50 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-indigo-300">
                    Experiment {exp.exp_number}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                    {exp.id}
                  </span>
                </div>
                <div className="font-syne font-semibold text-xs text-slate-100 truncate">
                  {exp.title}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1 truncate">
                  {exp.module_name}
                </div>
              </button>
            ))}
          </div>

          {/* Right: Detailed Experiment Specification */}
          <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-sm space-y-5">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-indigo-400 font-bold">
                  {selectedExp.id} — EXPERIMENT {selectedExp.exp_number}
                </span>
                <h3 className="font-syne font-bold text-lg text-white mt-0.5">
                  {selectedExp.title}
                </h3>
                <span className="text-xs font-mono text-cyan-300">{selectedExp.module_name}</span>
              </div>

              <button
                onClick={() => onExecuteExpScan(selectedExp.exp_number)}
                disabled={isScanning}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold rounded-lg transition-colors shadow-sm shrink-0"
              >
                {isScanning ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                <span>Run Exp {selectedExp.exp_number}</span>
              </button>
            </div>

            <div>
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-1">1. Aim & Objective:</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                {selectedExp.objective}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-1">2. Underlying Theoretical Principle:</h4>
              <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                {selectedExp.theory}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">3. Software Tools & Modules Mapped:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedExp.tools_mapped.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-cyan-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-1">4. Lab Evaluation Rubric & Observations:</h4>
              <p className="text-xs text-emerald-300 leading-relaxed bg-emerald-950/20 p-3 rounded-lg border border-emerald-900/30">
                {selectedExp.evaluation_rubric}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: INTERACTIVE LAB MISSION & OBSERVATION TABLE */}
      {activeTab === 'runner' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-syne font-bold text-base text-white">
                STUDENT LABORATORY RECORD — OBSERVATION TABLE
              </h3>
              <p className="text-xs text-slate-400">
                Pre-populated data ready for inclusion into formal lab records and mini-project defense.
              </p>
            </div>
            <button
              onClick={onOpenReportModal}
              className="px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white font-mono text-xs font-bold rounded-lg transition-colors"
            >
              Export Printable Lab Sheet
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Exp #</th>
                  <th className="p-3">Experiment Title</th>
                  <th className="p-3">Primary Parameter Measured</th>
                  <th className="p-3">Observed Value / Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                <tr>
                  <td className="p-3 text-indigo-400 font-bold">Exp 1</td>
                  <td className="p-3 text-slate-200">Information Gathering & Passive DNS</td>
                  <td className="p-3 text-slate-400">A / PTR / GeoIP Coordinates</td>
                  <td className="p-3 text-emerald-400 font-semibold">
                    {scanResult?.network_recon?.ip_addresses?.[0]
                      ? `${scanResult.network_recon.ip_addresses[0]} (${scanResult.network_recon.geoip?.country || 'GeoIP Resolved'})`
                      : 'Pending Scan Execution'}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-indigo-400 font-bold">Exp 2</td>
                  <td className="p-3 text-slate-200">Public CT Log Footprinting</td>
                  <td className="p-3 text-slate-400">CRT.sh Certificate Enumeration</td>
                  <td className="p-3 text-emerald-400 font-semibold">
                    {scanResult?.subdomain_recon?.total_found !== undefined
                      ? `${scanResult.subdomain_recon.total_found} Subdomains Logged (${scanResult.subdomain_recon.high_risk_subdomains.length} sensitive)`
                      : 'Pending Scan Execution'}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-indigo-400 font-bold">Exp 5</td>
                  <td className="p-3 text-slate-200">Web Recon & Banner Grabbing</td>
                  <td className="p-3 text-slate-400">HTTP Server & Runtime Headers</td>
                  <td className="p-3 text-emerald-400 font-semibold">
                    {scanResult?.web_stack?.server_header || 'Pending Scan Execution'}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-indigo-400 font-bold">Exp 6</td>
                  <td className="p-3 text-slate-200">Security Header Audit</td>
                  <td className="p-3 text-slate-400">HSTS / CSP / X-Frame-Options</td>
                  <td className="p-3 text-emerald-400 font-semibold">
                    {scanResult?.web_stack?.security_headers
                      ? `${Object.values(scanResult.web_stack.security_headers).filter((h) => h.present).length}/6 Defensive Headers Active`
                      : 'Pending Scan Execution'}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-indigo-400 font-bold">Exp 7</td>
                  <td className="p-3 text-slate-200">Identity & Digital Footprint</td>
                  <td className="p-3 text-slate-400">Multi-Platform Handle Correlation</td>
                  <td className="p-3 text-emerald-400 font-semibold">
                    {scanResult?.identity_recon?.match_count !== undefined
                      ? `${scanResult.identity_recon.match_count} Verified Public Accounts`
                      : 'Pending Scan Execution'}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-indigo-400 font-bold">Exp 8</td>
                  <td className="p-3 text-slate-200">Exposure Risk Quantifier</td>
                  <td className="p-3 text-slate-400">CVSS-Weighted Exposure Index</td>
                  <td className="p-3 text-cyan-400 font-bold">
                    {scanResult?.risk_assessment?.score !== undefined
                      ? `${scanResult.risk_assessment.score}/100 (${scanResult.risk_assessment.risk_level})`
                      : 'Pending Scan Execution'}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-indigo-400 font-bold">Exp 12</td>
                  <td className="p-3 text-slate-200">Formal Audit Reporting</td>
                  <td className="p-3 text-slate-400">HTML & JSON Remediation Package</td>
                  <td className="p-3 text-emerald-400 font-semibold">
                    Verified & Ready for Print Signoff
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: VIVA VOCE / ORAL DEFENSE QUESTIONS */}
      {activeTab === 'viva' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-sm space-y-4">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="font-syne font-bold text-base text-white">
              ORAL DEFENSE & VIVA VOCE QUESTION BANK
            </h3>
            <p className="text-xs text-slate-400">
              Frequently asked examiner questions for IoTCSBCL704 lab mini-project evaluations.
            </p>
          </div>

          <div className="space-y-4">
            {vivaQuestions.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg">
                <div className="flex items-start gap-2.5 text-xs font-mono font-bold text-cyan-300 mb-2">
                  <span className="text-indigo-400">Q{idx + 1}:</span>
                  <span>{item.q}</span>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed pl-6 border-l-2 border-indigo-500/30">
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
