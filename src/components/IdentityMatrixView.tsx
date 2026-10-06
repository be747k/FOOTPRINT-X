import React from 'react';
import {
  Users,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Key,
  Code2,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { IdentityData } from '../types/osint';

interface IdentityMatrixViewProps {
  identityData: IdentityData | null;
  targetUsername: string;
}

export const IdentityMatrixView: React.FC<IdentityMatrixViewProps> = ({
  identityData,
  targetUsername,
}) => {
  const profiles = identityData?.profiles_found || [];
  const matchCount = identityData?.match_count || 0;
  const totalScanned = identityData?.total_scanned || 6;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-indigo-400" />
              <h2 className="font-syne font-bold text-lg text-white">
                DIGITAL IDENTITY & HUMAN OSINT MATRIX (EXP-07)
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Cross-platform username correlation across developer repositories, tech forums, and cryptographic registries.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Target Identity:</span>
            <span className="text-indigo-300 font-bold bg-indigo-950/60 px-3 py-1 rounded border border-indigo-800/40">
              @{identityData?.username || targetUsername || 'N/A'}
            </span>
          </div>
        </div>

        {/* Footprint Breadth Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Profiles Correlated</span>
            <div className="text-3xl font-mono font-extrabold text-white mt-1">
              {matchCount} / {totalScanned}
            </div>
            <span className="text-xs font-mono text-slate-400 mt-1 block">
              Active Public Identifiers
            </span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Social Engineering Surface</span>
            <div
              className={`text-2xl font-mono font-bold mt-1 ${
                matchCount >= 4 ? 'text-rose-400' : matchCount >= 2 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {matchCount >= 4 ? 'HIGH EXPOSURE' : matchCount >= 2 ? 'MODERATE' : 'MINIMAL'}
            </div>
            <span className="text-xs font-mono text-slate-400 mt-1 block">
              Target Profiling Vulnerability
            </span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Cryptographic Identity</span>
            <div className="text-sm font-mono font-semibold text-cyan-400 mt-2 truncate">
              {profiles.some((p) => p.platform === 'Keybase') ? 'Keybase PGP Verified' : 'No Public PGP Key'}
            </div>
            <span className="text-xs font-mono text-slate-400 mt-1 block">
              Digital Signature Verification
            </span>
          </div>
        </div>
      </div>

      {/* Profiles Cards Grid */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <h3 className="font-syne font-bold text-sm text-white">
            PUBLIC PLATFORMS IDENTIFIED FOR @{identityData?.username || targetUsername || 'target'}
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Automated Endpoint Heuristics
          </span>
        </div>

        {profiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg hover:border-indigo-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={profile.platform}
                          className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400 font-bold font-mono text-xs">
                          {profile.platform.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-syne font-bold text-sm text-white">{profile.platform}</h4>
                        <span className="text-[10px] font-mono text-indigo-400">{profile.category}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-semibold">
                      VERIFIED
                    </span>
                  </div>

                  <div className="my-3 space-y-1 text-xs">
                    <div className="font-mono text-slate-200 font-semibold truncate">
                      {profile.title || `@${identityData?.username}`}
                    </div>
                    {profile.details && (
                      <p className="text-slate-400 text-[11px] line-clamp-2">{profile.details}</p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 mt-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">Public Footprint</span>
                  <a
                    href={profile.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-xs font-mono text-slate-500 italic bg-slate-950 rounded-lg">
            {identityData?.status === 'skipped'
              ? 'No target username provided for Module 4. Enter a handle in the Target Recon panel to execute.'
              : 'No matching public profiles discovered across scanned endpoints.'}
          </div>
        )}
      </div>
    </div>
  );
};
