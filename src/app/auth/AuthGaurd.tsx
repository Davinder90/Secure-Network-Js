'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ArrowLeft, Wifi, Terminal, Activity, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

import { getLocalStorage, removeLocalStorage } from '@helpers/localStorage';
import { AppDispatch } from '@redux-store/store';
import { login, logout } from '@redux-store/user.slice';
import { PATHS } from '@/src/lib/utils/ui/Paths.constant';
import { handleGetUserAllowance } from '@requests/user/auth';

/* -------------------------------------------------------------------------- */
/*                            SPLASH / LOADING SCREEN                         */
/* -------------------------------------------------------------------------- */

export const SplashScreen = () => {
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stages = [
    { label: 'Initializing Network Mesh', icon: Wifi },
    { label: 'Discovering Authoritative DNS Nodes', icon: Terminal },
    { label: 'Verifying Anycast & ASN Routing', icon: Activity },
    { label: 'Establishing Zero-Trust Handshake', icon: ShieldCheck },
  ];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 180 };
  const rotateX = useSpring(useTransform(mouseY, [-250, 250], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-250, 250], [-15, 15]), springConfig);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const nextVal = prev + Math.floor(Math.random() * 8) + 3;
        const bounded = Math.min(nextVal, 100);

        if (bounded > 75) setStageIndex(3);
        else if (bounded > 50) setStageIndex(2);
        else if (bounded > 25) setStageIndex(1);
        else setStageIndex(0);

        return bounded;
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      radius: Math.random() * 2 + 1,
    }));

    let mouse = { x: width / 2, y: height / 2 };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouseX.set(e.clientX - width / 2);
      mouseY.set(e.clientY - height / 2);
    };
    window.addEventListener('mousemove', onMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#94a3b8';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 130) {
            ctx.strokeStyle = `rgba(37, 99, 235, ${0.15 * (1 - dist / 130)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        const mouseDist = Math.hypot(p1.x - mouse.x, p1.y - mouse.y);
        if (mouseDist < 160) {
          ctx.strokeStyle = `rgba(220, 38, 38, ${0.25 * (1 - mouseDist / 160)})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [mouseX, mouseY]);

  const CurrentIcon = stages[stageIndex].icon;

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white text-black selection:bg-blue-600 selection:text-white">
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:40px_40px] opacity-80" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center select-none"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-xl shadow-blue-600/5 backdrop-blur-md cursor-pointer"
        >
          <motion.div
            animate={{ scale: 1, opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-2xl border-2 border-blue-500/30"
          />

          <img
            src="/applogo1.png"
            alt="SecureNet Logo"
            className="h-full w-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </motion.div>

        <div className="mt-6 space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-black sm:text-3xl">
            Secure<span className="text-blue-600">Net</span>
          </h2>
          <p className="font-mono text-[11px] tracking-widest text-gray-400 uppercase">
            Network Operations Console
          </p>
        </div>

        <div className="mt-6 w-full rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-1.5 text-gray-700 font-medium">
              <CurrentIcon className="h-3.5 w-3.5 text-blue-600 animate-spin" />
              <span className="truncate">{stages[stageIndex].label}</span>
            </div>
            <span className="font-mono font-bold text-gray-900">{progress}%</span>
          </div>

          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-red-500"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.2 }}
            />
          </div>
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-medium text-gray-500 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
          </span>
          Live Diagnostics Feed
        </div>
      </motion.div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                            ACCESS DENIED SCREEN                            */
/* -------------------------------------------------------------------------- */

interface AccessDeniedProps {
  username?: string;
  email?: string;
  setState: React.Dispatch<React.SetStateAction<'initial' | 'not-access' | 'access'>>;
}

const AccessDenied = ({ username, email, setState }: AccessDeniedProps) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleSignOut = () => {
    removeLocalStorage('sn-userInfo');
    dispatch(logout());
    setState('access');
    const targetPath = PATHS?.LOGIN_PATH || '/auth/login';
    router.replace(targetPath);
  };

  return (
    <div className="min-h-screen bg-white px-8 py-10">
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md space-y-4 text-left"
      >
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-red-600">
          <motion.span
            animate={{ scale: 1, opacity: [0.6,0.9]}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="h-2 w-2 rounded-full bg-red-600"
          />
          Access Denied
        </div>

        <div className="space-y-1">
          <h1 className="text-lg font-bold text-black">
            Unauthorized Account
          </h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            This Application is restricted. The account below does not have permission to view this page.
          </p>
        </div>

        <div className="pt-1">
          <span className="text-xs text-gray-400 block font-medium">Signed in as:</span>
          <p className="text-sm font-mono font-medium text-black break-all">
            {email || username || 'unknown-account@domain.com'}
          </p>
        </div>

        <div className="pt-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                            CLIENT AUTH GUARD                               */
/* -------------------------------------------------------------------------- */

export default function ClientAuthGaurd({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();

  const [state, setState] = useState<'initial' | 'not-access' | 'access'>('initial');
  const [userInfo, setUserInfo] = useState<{ username?: string; email?: string }>({});

  const handleIsAllowed = useCallback(async () => {
    const { result, success, message } = await handleGetUserAllowance();
    const allowed = success && (result?.isAllowed ?? false);
    if (!success && message) {
      toast.error(message);
    }
    return [success, allowed, result.role, result.productAccess] as const;
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Identify public routes (e.g., login or signup)
      const isAuthPage = pathname === PATHS.LOGIN_PATH || pathname?.startsWith('/auth');

      const stored = getLocalStorage('sn-userInfo');
      const token = stored?.access_token;
      const username = stored?.user?.username;
      const email = stored?.user?.email;

      // 2. Unauthenticated state
      if (!token) {
        if (isAuthPage) {
          // Allow login/register page to render without splash loop
          setState('access');
        } else {
          setState('access');
          router.replace(PATHS.LOGIN_PATH);
        }
        return;
      }

      // 3. Authenticated user visiting /auth/login -> Redirect to home
      if (isAuthPage && token) {
        router.replace('/');
        return;
      }
      // 4. Validate Allowance on protected routes
      try {
        const [success, allowed, role, productAccess] = await handleIsAllowed();
        if (success) {
          dispatch(login({ name: username, email, isAllowed: allowed, role, productAccess}));
          setState(allowed ? 'access' : 'not-access');
        } else {
          removeLocalStorage('sn-userInfo');
          dispatch(logout());
          setState('access');
          router.replace(PATHS.LOGIN_PATH);
        }
      } catch {
        setState('not-access');
      }
      setUserInfo({ username, email });
    };
    checkAuth();
  }, [pathname, router, handleIsAllowed, dispatch]);

  return (
    <AnimatePresence mode="wait">
      {state === 'initial' ? (
        <SplashScreen key="splash-screen" />
      ) : state === 'not-access' ? (
        <AccessDenied
          key="access-denied"
          username={userInfo.username}
          email={userInfo.email}
          setState={setState}
        />
      ) : (
        <motion.div
          key="authenticated-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
