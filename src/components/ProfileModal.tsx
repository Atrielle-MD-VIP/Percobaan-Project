import React, { useState, useEffect } from 'react';
import { X, User, Lock, KeyRound, LogOut, AlertCircle, CheckCircle, Eye, EyeOff, ShieldCheck, Sparkles, Activity, RefreshCw, Server, MapPin, Wifi, Copy, Check, Zap, Globe, Gauge, Clock } from 'lucide-react';

interface GeoData {
  ip: string;
  country_name: string;
  country_code: string;
  region: string;
  city: string;
  org: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { username: string } | null;
  onLogout: () => void;
  userQuota?: any;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  userQuota,
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Dashboard / Geolocation & Quota States
  const [geoData, setGeoData] = useState<GeoData | null>(null);
  const [isLoadingIp, setIsLoadingIp] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showFullIp, setShowFullIp] = useState(false);

  const userKey = currentUser?.username || 'guest';

  const [usedCount, setUsedCount] = useState(0);
  const [timeLeftToReset, setTimeLeftToReset] = useState('');
  const [quotaLimitStr, setQuotaLimitStr] = useState(() => {
    if (userQuota) {
      if (userQuota.isPermanent) return 'Unlimited';
      if (userQuota.isCustom) return String(userQuota.quotaLimit);
      return String(userQuota.quotaLimit || userQuota.globalLimit || 5);
    }
    return localStorage.getItem(`alight_${userKey}_quota_limit`) || '5';
  });
  const [quotaPeriodStr, setQuotaPeriodStr] = useState(() => {
    if (userQuota?.period) return userQuota.period;
    return localStorage.getItem(`alight_${userKey}_quota_period`) || 'harian';
  });
  const [remainingQuotaStr, setRemainingQuotaStr] = useState(() => {
    if (userQuota) {
      return userQuota.isPermanent ? '∞' : String(userQuota.remainingQuota);
    }
    return localStorage.getItem(`alight_${userKey}_remaining`) || '5';
  });
  const [resetHoursStr, setResetHoursStr] = useState('24');
  const [isPermanentQuota, setIsPermanentQuota] = useState(() => {
    if (userQuota) return !!userQuota.isPermanent;
    return localStorage.getItem(`alight_${userKey}_permanent`) === 'true';
  });
  const [isCustomQuota, setIsCustomQuota] = useState(() => {
    if (userQuota) return !!userQuota.isCustom || !!userQuota.isPermanent;
    return localStorage.getItem(`alight_${userKey}_custom`) === 'true';
  });
  const [customReason, setCustomReason] = useState(() => {
    if (userQuota) {
      return userQuota.isPermanent ? (userQuota.reason || 'Akses Limit Unlimited') : (userQuota.reason || '');
    }
    return localStorage.getItem(`alight_${userKey}_reason`) || '';
  });

  const [licenseBadge, setLicenseBadge] = useState(() => localStorage.getItem('alight_license_badge') || 'ACTIVE');
  const [licenseTitle, setLicenseTitle] = useState(() => localStorage.getItem('alight_license_title') || 'PRO ACTIVE (1 TAHUN)');

  useEffect(() => {
    const handleSettingsUpdated = () => {
      setLicenseBadge(localStorage.getItem('alight_license_badge') || 'ACTIVE');
      setLicenseTitle(localStorage.getItem('alight_license_title') || 'PRO ACTIVE (1 TAHUN)');
    };
    window.addEventListener('alight_settings_updated', handleSettingsUpdated);
    return () => window.removeEventListener('alight_settings_updated', handleSettingsUpdated);
  }, []);

  const applyQuotaData = (data: any) => {
    if (!data) return;
    const uKey = currentUser?.username || 'guest';
    if (data.isPermanent) {
      setIsPermanentQuota(true);
      setIsCustomQuota(true);
      setQuotaLimitStr('Unlimited');
      setRemainingQuotaStr('∞');
      setCustomReason(data.reason || 'Akses Limit Unlimited');
      localStorage.setItem(`alight_${uKey}_quota_limit`, 'Unlimited');
      localStorage.setItem(`alight_${uKey}_remaining`, '∞');
      localStorage.setItem(`alight_${uKey}_permanent`, 'true');
      localStorage.setItem(`alight_${uKey}_custom`, 'true');
      localStorage.setItem(`alight_${uKey}_reason`, data.reason || 'Akses Limit Unlimited');
    } else if (data.isCustom) {
      setIsPermanentQuota(false);
      setIsCustomQuota(true);
      setQuotaLimitStr(String(data.quotaLimit));
      setRemainingQuotaStr(String(data.remainingQuota));
      setCustomReason(data.reason || '');
      localStorage.setItem(`alight_${uKey}_quota_limit`, String(data.quotaLimit));
      localStorage.setItem(`alight_${uKey}_remaining`, String(data.remainingQuota));
      localStorage.setItem(`alight_${uKey}_permanent`, 'false');
      localStorage.setItem(`alight_${uKey}_custom`, 'true');
      localStorage.setItem(`alight_${uKey}_reason`, data.reason || '');
    } else {
      setIsPermanentQuota(false);
      setIsCustomQuota(false);
      setQuotaLimitStr(String(data.quotaLimit || data.globalLimit || 5));
      setRemainingQuotaStr(String(data.remainingQuota));
      localStorage.setItem(`alight_${uKey}_quota_limit`, String(data.quotaLimit || data.globalLimit || 5));
      localStorage.setItem(`alight_${uKey}_remaining`, String(data.remainingQuota));
      localStorage.setItem(`alight_${uKey}_permanent`, 'false');
      localStorage.setItem(`alight_${uKey}_custom`, 'false');
      localStorage.removeItem(`alight_${uKey}_reason`);
    }
    if (typeof data.usedCount === 'number') {
      setUsedCount(data.usedCount);
    }
    if (data.period) {
      setQuotaPeriodStr(data.period);
      localStorage.setItem(`alight_${uKey}_quota_period`, data.period);
    }
    if (data.resetHours) {
      setResetHoursStr(data.resetHours);
    }
  };

  useEffect(() => {
    if (userQuota) {
      applyQuotaData(userQuota);
    } else if (currentUser?.username) {
      const uKey = currentUser.username;
      setQuotaLimitStr(localStorage.getItem(`alight_${uKey}_quota_limit`) || '5');
      setQuotaPeriodStr(localStorage.getItem(`alight_${uKey}_quota_period`) || 'harian');
      setRemainingQuotaStr(localStorage.getItem(`alight_${uKey}_remaining`) || '5');
      setIsPermanentQuota(localStorage.getItem(`alight_${uKey}_permanent`) === 'true');
      setIsCustomQuota(localStorage.getItem(`alight_${uKey}_custom`) === 'true');
      setCustomReason(localStorage.getItem(`alight_${uKey}_reason`) || '');
    }
  }, [userQuota, currentUser?.username]);

  const maskIp = (ipStr: string) => {
    if (!ipStr) return '***.***.***.***';
    if (ipStr.includes('.')) {
      const parts = ipStr.split('.');
      if (parts.length === 4) return `${parts[0]}.${parts[1]}.***.***`;
    }
    if (ipStr.includes(':')) {
      const parts = ipStr.split(':');
      return `${parts[0]}:${parts[1]}:****:****`;
    }
    return '***.***.***.***';
  };

  const fetchRealIpInfo = async () => {
    setIsLoadingIp(true);
    try {
      const res = await fetch('https://ipwho.is/').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (data && data.ip) {
          setGeoData({
            ip: data.ip,
            country_name: data.country || 'Unknown',
            country_code: data.country_code || '??',
            region: data.region || 'Unknown',
            city: data.city || 'Unknown',
            org: data.connection?.isp || data.connection?.org || 'Unknown Provider',
          });
          return;
        }
      }

      const res2 = await fetch('https://ipapi.co/json/').catch(() => null);
      if (res2 && res2.ok) {
        const data2 = await res2.json();
        if (data2 && data2.ip) {
          setGeoData({
            ip: data2.ip,
            country_name: data2.country_name || 'Unknown',
            country_code: data2.country_code || '??',
            region: data2.region || 'Unknown',
            city: data2.city || 'Unknown',
            org: data2.org || 'Unknown Provider',
          });
          return;
        }
      }

      const res3 = await fetch('https://api.ipify.org?format=json').catch(() => null);
      if (res3 && res3.ok) {
        const data3 = await res3.json();
        if (data3 && data3.ip) {
          setGeoData({
            ip: data3.ip,
            country_name: 'Unknown',
            country_code: '??',
            region: 'Unknown',
            city: 'Unknown',
            org: 'Unknown',
          });
          return;
        }
      }
    } catch {
      setGeoData({
        ip: '-',
        country_name: 'Unknown',
        country_code: '??',
        region: 'Unknown',
        city: 'Unknown',
        org: 'Unknown',
      });
    } finally {
      setIsLoadingIp(false);
    }
  };

  const fetchQuotaInfo = async () => {
    try {
      const usernameParam = currentUser?.username ? `?username=${encodeURIComponent(currentUser.username)}` : '';
      const res = await fetch(`/api/user/quota-info${usernameParam}`);
      if (res.ok) {
        const data = await res.json();
        applyQuotaData(data);
      }
    } catch (e) {
      console.error('Failed to fetch quota info:', e);
    }
  };

  const loadSettings = () => {
    try {
      const savedOrders = localStorage.getItem('alightpro_orders');
      if (savedOrders) {
        const orders = JSON.parse(savedOrders);
        const today = new Date().toDateString();
        const todayOrders = orders.filter((o: any) => new Date(o.createdAt || Date.now()).toDateString() === today);
        setUsedCount(todayOrders.length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg(null);
      setSuccessMsg(null);
      setIsLoading(false);
      setIsChangingPass(false);
      loadSettings();
      if (!userQuota) {
        fetchQuotaInfo();
      }
      fetchRealIpInfo();
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (!isOpen) return;

    const updateResetTimer = () => {
      const rHoursNum = parseFloat(resetHoursStr) || 24;
      const diff = rHoursNum * 3600 * 1000 - (Date.now() % (rHoursNum * 3600 * 1000));

      if (diff > 0) {
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeftToReset(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      } else {
        setTimeLeftToReset('00:00:00');
      }
    };

    updateResetTimer();
    const timer = setInterval(updateResetTimer, 1000);
    return () => clearInterval(timer);
  }, [isOpen, resetHoursStr]);

  if (!isOpen || !currentUser) return null;

  const handleCopy = (text: string, fieldKey: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const limitParsed = parseFloat(quotaLimitStr);
  const numericMaxQuota = (!isNaN(limitParsed) && quotaLimitStr !== 'Unlimited') ? limitParsed : 5;
  const displayRemainingQuota = String(Math.max(0, numericMaxQuota - usedCount));
  const usagePercentage = numericMaxQuota > 0 ? Math.min(100, Math.round((usedCount / numericMaxQuota) * 100)) : 0;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!oldPassword) {
      setErrorMsg('Password lama wajib diisi.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password baru minimal 6 karakter!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi password baru tidak cocok!');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser.username,
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Gagal mengubah password.');
        setIsLoading(false);
        return;
      }

      setSuccessMsg('Password berhasil diperbarui!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsLoading(false);
      setTimeout(() => {
        setIsChangingPass(false);
        setSuccessMsg(null);
      }, 1500);
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-[400px] bg-white dark:bg-slate-900 border-[2px] border-slate-900 dark:border-slate-700/80 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.4),_3px_3px_0px_#0f172a] dark:shadow-[0_15px_40px_rgba(0,0,0,0.6),_2px_2px_0px_#334155] overflow-hidden transition-all max-h-[88vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-3 sm:p-3.5 border-b-[2px] border-slate-900 dark:border-slate-700 flex items-center justify-between text-white shrink-0 relative overflow-hidden">
          {/* Subtle Ambient Background Accent */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
 
          <div className="flex items-center gap-2.5 relative z-10">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-indigo-300/40 flex items-center justify-center text-white shadow-md font-black text-lg tracking-tight">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-emerald-500 border border-slate-900 rounded-full flex items-center justify-center text-white shadow-sm" title="VIP Verified">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            </div>
 
            <div>
              <h2 className="font-black text-sm tracking-tight leading-tight flex items-center gap-1.5 text-white">
                <span>{currentUser.username}</span>
                <span className="inline-flex items-center gap-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                  VERIFIED
                </span>
              </h2>
              <p className="text-[9px] text-slate-300 font-medium mt-0.5">
                Profil Pengguna & Dashboard Sistem
              </p>
            </div>
          </div>
 
          <button
            onClick={onClose}
            className="w-7.5 h-7.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-slate-200 hover:text-white transition-all cursor-pointer active:scale-95 relative z-10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
 
        {/* Content Body (Scrollable) */}
        <div className="p-3 sm:p-3.5 space-y-3 overflow-y-auto flex-1 custom-scrollbar no-scrollbar">
          
          {/* Status Toast Notification */}
          {errorMsg && (
            <div className="bg-rose-500/10 border-2 border-rose-500 text-rose-800 dark:text-rose-200 p-2.5 rounded-xl text-[11px] font-bold flex items-center gap-2 shadow-[1.5px_1.5px_0px_#f43f5e] animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
 
          {successMsg && (
            <div className="bg-emerald-500/10 border-2 border-emerald-500 text-emerald-800 dark:text-emerald-200 p-2.5 rounded-xl text-[11px] font-bold flex items-center gap-2 shadow-[1.5px_1.5px_0px_#10b981] animate-in fade-in">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
 
          {/* User Account Info Card */}
          <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-2.5 border-2 border-slate-900 dark:border-slate-700 shadow-[1.5px_1.5px_0px_#0f172a] dark:shadow-[1.5px_1.5px_0px_#334155] grid grid-cols-2 gap-2">
            <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border-2 border-slate-900 dark:border-slate-700/80 flex flex-col justify-between shadow-[1px_1px_0px_#0f172a] dark:shadow-none">
              <span className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Username</span>
              <span className="font-black text-xs text-slate-900 dark:text-white truncate mt-0.5">
                {currentUser.username}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border-2 border-slate-900 dark:border-slate-700/80 flex flex-col justify-between shadow-[1px_1px_0px_#0f172a] dark:shadow-none">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Status Lisensi</span>
                <span className="text-[8px] uppercase tracking-wider font-black px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  {licenseBadge}
                </span>
              </div>
              <span className="font-black text-[10px] inline-flex items-center gap-0.5 mt-0.5 truncate text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0" />
                <span className="truncate">{licenseTitle}</span>
              </span>
            </div>
          </div>
 
          {/* 📊 DASHBOARD SECTION INSIDE PROFILE MODAL */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pt-0.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5.5 h-5.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Activity className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <h3 className="font-black text-[10px] text-slate-900 dark:text-white uppercase tracking-wider">
                    DASHBOARD AKUN & IP SYSTEM
                  </h3>
                </div>
                <p className="text-[9px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Detail batas limit & IP terdeteksi
                </p>
              </div>
 
              <button
                onClick={fetchRealIpInfo}
                disabled={isLoadingIp}
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-slate-900 dark:border-slate-600 flex items-center gap-1 text-slate-900 dark:text-white text-[10px] font-black shadow-[1px_1px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                title="Refresh Info IP"
              >
                <RefreshCw className={`w-3 h-3 text-indigo-500 ${isLoadingIp ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline text-[9px] uppercase">Refresh</span>
              </button>
            </div>
 
            {/* Network Information Box */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-900 dark:border-slate-700 rounded-2xl p-2.5 space-y-1.5 shadow-[1.5px_1.5px_0px_#0f172a] dark:shadow-[1.5px_1.5px_0px_#334155]">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80 pb-1.5">
                <span className="text-[9px] font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-1">
                  <Globe className="w-3 h-3 text-indigo-500" />
                  Detail Informasi Jaringan
                </span>
                <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-black text-[8px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 uppercase tracking-wider">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  Koneksi Aktif
                </span>
              </div>
 
              <div className="space-y-1">
                {/* IP Address */}
                <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                      <Server className="w-3.5 h-3.5 text-indigo-500 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">ALAMAT IP</p>
                      <p className="font-mono font-black text-[11px] text-slate-900 dark:text-white truncate">
                        {isLoadingIp ? 'Mendeteksi...' : showFullIp ? (geoData?.ip || '') : maskIp(geoData?.ip || '')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowFullIp(!showFullIp)}
                      className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer transition-all"
                      title={showFullIp ? "Sembunyikan IP" : "Tampilkan IP"}
                    >
                      {showFullIp ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(geoData?.ip || '', 'ip')}
                      className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer transition-all flex items-center gap-1"
                      title="Salin IP"
                    >
                      {copiedField === 'ip' ? <Check className="w-3 h-3 text-emerald-500 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
 
                {/* Country */}
                <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                      <div className="w-3.5 h-2 rounded-xs flex flex-col overflow-hidden shrink-0 border border-slate-900">
                        <div className="h-1/2 bg-red-600 w-full"></div>
                        <div className="h-1/2 bg-white w-full"></div>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">NEGARA</p>
                      <p className="font-extrabold text-[11px] text-slate-900 dark:text-white truncate">
                        {isLoadingIp ? 'Memuat...' : `${geoData?.country_name || 'Indonesia'} (${geoData?.country_code || 'ID'})`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(`${geoData?.country_name} (${geoData?.country_code})`, 'country')}
                    className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer transition-all"
                  >
                    {copiedField === 'country' ? <Check className="w-3 h-3 text-emerald-500 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
 
                {/* Region & City */}
                <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">WILAYAH & KOTA</p>
                      <p className="font-extrabold text-[11px] text-slate-900 dark:text-white truncate">
                        {isLoadingIp ? 'Memuat...' : `${geoData?.city || 'Jakarta'}, ${geoData?.region || 'Indonesia'}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(`${geoData?.city}, ${geoData?.region}`, 'city')}
                    className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer transition-all"
                  >
                    {copiedField === 'city' ? <Check className="w-3 h-3 text-emerald-500 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
 
                {/* ISP */}
                <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                      <Wifi className="w-3.5 h-3.5 text-cyan-500 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">ISP / PENYEDIA</p>
                      <p className="font-extrabold text-[11px] text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-[200px]">
                        {isLoadingIp ? 'Memuat...' : (geoData?.org || 'Internet Service Provider')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(geoData?.org || '', 'isp')}
                    className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer transition-all"
                  >
                    {copiedField === 'isp' ? <Check className="w-3 h-3 text-emerald-500 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Quota Stats Grid */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-3 gap-1.5">
                <div className="bg-indigo-50/70 dark:bg-slate-800/90 border-2 border-slate-900 dark:border-slate-700 rounded-xl p-2 shadow-[1px_1px_0px_#0f172a] dark:shadow-[1px_1px_0px_#334155]">
                  <p className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">BATAS HARIAN</p>
                  <p className="font-black text-xs text-slate-900 dark:text-white mt-0.5 truncate">
                    {quotaLimitStr === 'Unlimited' ? '5' : quotaLimitStr} <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">x/{quotaPeriodStr}</span>
                  </p>
                </div>

                <div className="bg-emerald-50/70 dark:bg-slate-800/90 border-2 border-slate-900 dark:border-slate-700 rounded-xl p-2 shadow-[1px_1px_0px_#0f172a] dark:shadow-[1px_1px_0px_#334155]">
                  <p className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">SISA LIMIT</p>
                  <p className="font-black text-xs text-slate-900 dark:text-white mt-0.5 truncate">
                    {displayRemainingQuota} <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">Terpakai {usedCount}x</span>
                  </p>
                </div>

                <div className="bg-amber-50/70 dark:bg-slate-800/90 border-2 border-slate-900 dark:border-slate-700 rounded-xl p-2 shadow-[1px_1px_0px_#0f172a] dark:shadow-[1px_1px_0px_#334155]">
                  <p className="text-[8px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">WAKTU RESET</p>
                  <p className="font-mono font-black text-[10px] text-slate-900 dark:text-white mt-0.5 truncate">
                    {timeLeftToReset || '00:00:00'}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-900 dark:border-slate-700 rounded-2xl p-2.5 space-y-1.5 shadow-[1px_1px_0px_#0f172a] dark:shadow-[1px_1px_0px_#334155]">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-indigo-500" />
                  Penggunaan Limit
                </span>
                <span className="font-black text-indigo-600 dark:text-indigo-400 text-[10px]">
                  {usedCount} Dari {quotaLimitStr === 'Unlimited' ? '5' : quotaLimitStr} Verifikasi ({usagePercentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 h-2.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-500 to-emerald-400"
                  style={{ width: `${Math.min(100, Math.max(5, usagePercentage))}%` }}
                ></div>
              </div>
            </div>
          </div>
 
          {/* Reset / Change Password Section */}
          {!isChangingPass ? (
            <button
              onClick={() => setIsChangingPass(true)}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black py-2 px-3 rounded-xl border-2 border-slate-900 flex items-center justify-center gap-1.5 shadow-[1.5px_1.5px_0px_#0f172a] dark:shadow-[1px_1px_0px_#334155] active:translate-x-0.5 active:translate-y-0.5 transition-all text-[11px] cursor-pointer tracking-wide uppercase"
            >
              <KeyRound className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Reset / Ganti Password</span>
            </button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-2 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border-2 border-slate-900 dark:border-slate-700 shadow-[1.5px_1.5px_0px_#0f172a] animate-in fade-in">
              <div className="flex items-center justify-between border-b pb-1.5 border-slate-200 dark:border-slate-700">
                <h3 className="text-[10px] font-black uppercase text-slate-900 dark:text-white flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  <span>Form Ganti Password</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsChangingPass(false)}
                  className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-wider"
                >
                  Batal
                </button>
              </div>
 
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-700 dark:text-slate-300 mb-0.5">
                  Password Lama
                </label>
                <div className="relative">
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan password saat ini"
                    className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-lg text-[11px] font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showOldPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
 
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-700 dark:text-slate-300 mb-0.5">
                  Password Baru <span className="text-slate-400 font-normal lowercase">(min 6)</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru"
                    className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-lg text-[11px] font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
 
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-700 dark:text-slate-300 mb-0.5">
                  Ulangi Password Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password baru"
                  className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-lg text-[11px] font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
 
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2 px-3 rounded-lg border-2 border-slate-900 flex items-center justify-center gap-1.5 shadow-[1.5px_1.5px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all text-[11px] cursor-pointer uppercase tracking-wider"
              >
                {isLoading ? (
                  <span className="flex items-center gap-1 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-300" /> Memproses...
                  </span>
                ) : (
                  <span>Simpan Password Baru</span>
                )}
              </button>
            </form>
          )}
 
          {/* Logout Button */}
          <button
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-black py-2 px-3 rounded-xl border-2 border-rose-500 flex items-center justify-center gap-1.5 shadow-[1.5px_1.5px_0px_#f43f5e] active:translate-x-0.5 active:translate-y-0.5 transition-all text-[11px] cursor-pointer uppercase tracking-wider"
          >
            <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </div>
    </div>
  );
};

