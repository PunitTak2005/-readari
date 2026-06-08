import React, { useState } from 'react';
import { BookOpen, User, Mail, Lock, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import logo from '../assets/logo.png';

const CITATIONS = [
  { text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.", author: "George R.R. Martin" },
  { text: "You can never get a cup of tea large enough or a book long enough to suit me.", author: "C.S. Lewis" },
  { text: "Books are a uniquely portable magic.", author: "Stephen King" },
  { text: "Reading is escape, and the opposite of escape; it's a way to make contact with reality after a day of making things up.", author: "Nora Ephron" }
];

export const AuthScreen = ({
  onLogin,
  onRegister,
  isFirebaseConfigured,
  onGoogleSignIn,
  onSkipToSandbox
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Pick a stable quote based on page loads
  const quote = CITATIONS[isSignUp ? 0 : 2];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password || (isSignUp && !name)) {
      setError("Please fill in all empty fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (isSignUp) {
      const res = await onRegister(email, name, password);
      if (res.success) {
        setSuccessMsg("Welcome aboard, dear Reader! Preparing your shelf...");
      } else {
        setError(res.error || "Could not register details.");
      }
    } else {
      const res = await onLogin(email, password);
      if (res.success) {
        setSuccessMsg("Welcome back to your shelf!");
      } else {
        setError(res.error || "Authentication failed. Check credentials.");
      }
    }
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setSuccessMsg(null);
  };

  return (
    <div id="auth-screen" className="min-h-screen bg-editorial-paper flex items-center justify-center p-4 sm:p-8 selection:bg-editorial-ink selection:text-white">
      <div className="w-full max-w-4xl bg-white border border-editorial-ink/15 shadow-sm grid grid-cols-1 md:grid-cols-12 min-h-[580px] rounded-none overflow-hidden">
        
        {/* Left Editorial Core Content (Quote and Brand) */}
        <div className="md:col-span-5 bg-editorial-ink text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle page lines style */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="w-full h-full" style={{
              backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }} />
          </div>

          <div className="relative z-10">
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-white/60 font-black block mb-4">
              ARCHIVAL COLLECTION
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl uppercase tracking-tighter leading-none mb-1">
              Readari
            </h2>
            <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-white/50 border-t border-white/10 pt-2 shrink-0">
              Personal Reading Journal
            </p>
          </div>

          <div className="relative z-10 my-12 md:my-0">
            <span className="font-sans text-[32px] font-black text-white/20 leading-none select-none block -mb-4 font-serif">“</span>
            <p className="font-serif italic text-base text-white/90 leading-relaxed mb-3">
              {quote.text}
            </p>
            <span className="font-sans text-[10px] uppercase tracking-widest text-[#ffffff]/60 font-black">
              — {quote.author}
            </span>
          </div>

          <div className="relative z-10 text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-white/40 flex items-center gap-1.5 pt-4 border-t border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-white/55" />
            <span>Encrypted Local-First Ledger</span>
          </div>
        </div>

        {/* Right Authentication Form */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-[360px] w-full mx-auto">
            
            <div className="mb-8 text-center">
              <img src={logo} alt="Readari logo" className="mx-auto mb-5 w-20 h-20 object-contain" />
              <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-editorial-ink/65 font-black block mb-1">
                JOURNAL ACCESS
              </span>
              <h1 className="font-serif font-black text-3xl text-editorial-ink">
                {isSignUp ? "Create Log" : "Authenticate"}
              </h1>
              <p className="font-serif italic text-sm text-editorial-ink/60 mt-1">
                {isSignUp ? "Catalogue your reading credentials." : "Open your personalized literary ledger."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="font-sans text-[9px] uppercase tracking-widest text-editorial-ink/75 font-black block mb-1.5">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-editorial-ink/40" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jane Austen"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-sm pl-10 pr-4 py-3 bg-editorial-bone/40 border border-editorial-ink/15 focus:border-editorial-ink outline-none text-editorial-ink rounded-none placeholder:text-editorial-ink/35 font-serif focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="font-sans text-[9px] uppercase tracking-widest text-editorial-ink/75 font-black block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-editorial-ink/40" />
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm pl-10 pr-4 py-3 bg-editorial-bone/40 border border-editorial-ink/15 focus:border-editorial-ink outline-none text-editorial-ink rounded-none placeholder:text-editorial-ink/35 font-sans focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-widest text-editorial-ink/75 font-black">
                    Secured Password
                  </label>
                  {isSignUp && (
                    <span className="font-sans text-[8px] text-editorial-ink/50 uppercase tracking-wider font-bold">
                      Min. 6 chars
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-editorial-ink/40" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-sm pl-10 pr-4 py-3 bg-editorial-bone/40 border border-editorial-ink/15 focus:border-editorial-ink outline-none text-editorial-ink rounded-none placeholder:text-editorial-ink/35 font-sans focus:bg-white transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 p-3 text-xs text-rose-900 font-sans leading-relaxed select-none">
                  <span className="font-bold underline block mb-0.5">AUTHENTICATION ERROR</span>
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 font-sans leading-relaxed select-none">
                  <span className="font-bold underline block mb-0.5">SUCCESS</span>
                  {successMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-editorial-ink text-white hover:bg-editorial-charcoal font-sans text-xs uppercase tracking-widest font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-6"
              >
                <span>{isSignUp ? "Register Account" : "Access Library"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Google Authentication if configured */}
            {isFirebaseConfigured && onGoogleSignIn && (
              <div className="mt-6 pt-5 border-t border-editorial-ink/10 space-y-3">
                <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#1a1a1a]/40 font-bold block text-center">
                  Or link online cloud
                </span>
                <button
                  type="button"
                  onClick={onGoogleSignIn}
                  className="w-full py-2.5 border border-editorial-ink/15 hover:border-editorial-ink text-editorial-ink font-sans text-[10px] uppercase tracking-widest font-black transition-all bg-white cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5 block shrink-0" viewBox="0 0 24 24" referrerPolicy="no-referrer">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.49 3.77v3.13h4.01c2.34-2.16 3.68-5.32 3.68-8.75z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-4.01-3.13c-1.11.75-2.53 1.19-3.92 1.19-3.02 0-5.57-2.04-6.48-4.79H1.31v3.23A11.97 11.97 0 0 0 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.52 14.36A7.16 7.16 0 0 1 5.1 12c0-.82.14-1.62.42-2.36V6.41H1.31A11.94 11.94 0 0 0 0 12C0 14.1.4 16.1 1.13 17.96l4.39-3.6z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.31 6.41l4.21 3.55c.91-2.75 3.46-4.79 6.48-4.79s0 0 0 0z"
                    />
                  </svg>
                  <span>Link with Google Profile</span>
                </button>
              </div>
            )}

            {!isFirebaseConfigured && (
              <div className="mt-5 text-center">
                <p className="font-sans text-[8px] uppercase tracking-widest text-editorial-ink/40 font-bold flex items-center justify-center gap-1.5 bg-editorial-bone/50 py-2 border border-editorial-ink/5">
                  <Sparkles className="w-3 h-3 text-editorial-ink/50" />
                  <span>Secure Local Database Instance Active</span>
                </p>
              </div>
            )}

            <div className="mt-8 text-center text-xs">
              <span className="font-serif text-editorial-ink/50 text-xs mr-1">
                {isSignUp ? "Already have a notebook?" : "New to this catalog?"}
              </span>
              <button
                type="button"
                onClick={handleToggleMode}
                className="font-sans text-[10px] uppercase font-black text-editorial-ink tracking-wider hover:underline bg-transparent border-0 cursor-pointer p-0"
              >
                {isSignUp ? "Login instead [-]" : "Create Account [+]"}
              </button>
            </div>

            {onSkipToSandbox && (
              <div className="mt-6 text-center pt-4 border-t border-editorial-ink/10">
                <button
                  type="button"
                  onClick={onSkipToSandbox}
                  className="font-sans text-[9px] uppercase tracking-widest font-black text-[#1a1a1a]/45 hover:text-editorial-ink transition-colors"
                >
                  ✦ Browse Guest Sandbox
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
