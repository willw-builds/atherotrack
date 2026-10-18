import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Github,
  Terminal,
  Copy,
  Check,
  Download,
  Package,
  Layers,
  ExternalLink,
  Code2,
} from 'lucide-react';

interface AndroidGitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidGitHubModal: React.FC<AndroidGitHubModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [gitUsername, setGitUsername] = useState('willieyw9');
  const [gitRepoName, setGitRepoName] = useState('atherotrack');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const gitPushCommand = `# 1. Link this project to your new GitHub repository:
git remote add origin https://github.com/${gitUsername}/${gitRepoName}.git
git branch -M main
git push -u origin main`;

  const capacitorCommands = `# 1. Build web production bundle:
npm run build

# 2. Add Android native platform (generates Android Studio project):
npx cap add android

# 3. Open in Android Studio to build APK or run on Android emulator/phone:
npx cap open android`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Android App & GitHub Open Source Hub
              </h2>
              <p className="text-xs text-slate-500">
                Install on Android, generate native APK with Capacitor, or push to GitHub
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700">
          {/* Section 1: Android PWA (Instant Mobile App) */}
          <div className="border border-slate-200 rounded-xl p-4 bg-rose-50/30">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
                  <Smartphone className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-slate-900 text-sm">
                  1. Instant Android Installation (WebAPK / PWA)
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Ready to Install
              </span>
            </div>

            <p className="text-slate-600 mt-2 leading-relaxed">
              AtheroTrack is configured as an Android Progressive Web App with offline service worker caching, Android system status bar theme color (<code className="text-rose-700">#e11d48</code>), and 512x512 adaptive maskable launcher icons.
            </p>

            <div className="mt-3 p-3 bg-white rounded-lg border border-rose-200/80 space-y-2">
              <span className="font-semibold text-slate-800 block">How to install on Android phone:</span>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                <li>Open this app URL in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong> on your Android phone.</li>
                <li>Tap the browser menu button (<strong>⋮</strong> three dots in top-right).</li>
                <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                <li>AtheroTrack will install into your Android App Drawer with its own icon, splash screen, and standalone window without browser UI.</li>
              </ol>
            </div>
          </div>

          {/* Section 2: GitHub Open Source Push */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-slate-200 text-slate-800 rounded-lg">
                  <Github className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-slate-900 text-sm">
                  2. Upload to Your GitHub (Open Source)
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                Git Repo Initialized
              </span>
            </div>

            <p className="text-slate-600 mt-2 leading-relaxed">
              The project is packaged with an open source <strong>Apache 2.0 License</strong>, comprehensive <strong>README.md</strong>, and git configuration. To publish it to your GitHub account:
            </p>

            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block">Your GitHub Username</label>
                  <input
                    type="text"
                    value={gitUsername}
                    onChange={e => setGitUsername(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block">GitHub Repository Name</label>
                  <input
                    type="text"
                    value={gitRepoName}
                    onChange={e => setGitRepoName(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="bg-slate-900 text-slate-100 rounded-xl p-3.5 font-mono text-xs overflow-x-auto">
                  <pre>{gitPushCommand}</pre>
                </div>
                <button
                  onClick={() => copyToClipboard(gitPushCommand, 'git')}
                  className="absolute right-2.5 top-2.5 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors flex items-center gap-1 text-[11px]"
                  title="Copy git commands"
                >
                  {copiedSection === 'git' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-500">
                Tip: First visit <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-rose-600 hover:underline inline-flex items-center gap-0.5">github.com/new <ExternalLink className="w-2.5 h-2.5" /></a> to create the public repository, then run the commands above in your local terminal.
              </p>
            </div>
          </div>

          {/* Section 3: Native Android APK with Capacitor */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-sky-100 text-sky-800 rounded-lg">
                  <Package className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-slate-900 text-sm">
                  3. Build Native Android APK / Google Play Package (Capacitor)
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                Capacitor Configured
              </span>
            </div>

            <p className="text-slate-600 mt-2 leading-relaxed">
              This codebase has <code className="text-slate-800 font-semibold">@capacitor/core</code> and <code className="text-slate-800 font-semibold">capacitor.config.json</code> (App ID: <code className="text-rose-700">com.atherotrack.app</code>). You can generate an Android Studio project to build a debug <code className="text-slate-800">.apk</code> or Google Play release bundle:
            </p>

            <div className="mt-3 relative">
              <div className="bg-slate-900 text-slate-100 rounded-xl p-3.5 font-mono text-xs overflow-x-auto">
                <pre>{capacitorCommands}</pre>
              </div>
              <button
                onClick={() => copyToClipboard(capacitorCommands, 'cap')}
                className="absolute right-2.5 top-2.5 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors flex items-center gap-1 text-[11px]"
                title="Copy Capacitor commands"
              >
                {copiedSection === 'cap' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
