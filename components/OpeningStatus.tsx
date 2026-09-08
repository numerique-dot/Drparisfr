import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, ChevronDown, Phone, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { COMPANY_INFO } from '../constants';
import { useLanguage } from '../lib/LanguageContext';

export interface OpeningStatusProps {
  className?: string;
  variant?: 'navbar' | 'compact' | 'full';
}

interface ParisTimeInfo {
  isOpen: boolean;
  isClosingSoon: boolean;
  dayOfWeek: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  dayName: string;
  hour: number;
  minute: number;
  timeString: string;
  statusLabelKey: string;
  statusDetailKey: string;
}

function computeParisStatus(): ParisTimeInfo {
  const now = new Date();

  // Extract Paris time components safely
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Paris',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23'
  });

  const parts = formatter.formatToParts(now);
  const partMap: Record<string, string> = {};
  for (const part of parts) {
    partMap[part.type] = part.value;
  }

  const weekdayStr = partMap.weekday; // 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
  const hour = parseInt(partMap.hour || '0', 10);
  const minute = parseInt(partMap.minute || '0', 10);

  const daysMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  };
  const dayOfWeek = daysMap[weekdayStr] ?? now.getDay();

  const totalMinutes = hour * 60 + minute;
  const openMinutes = 10 * 60;  // 10:00
  const closeMinutes = 20 * 60; // 20:00
  const isClosingSoonMinutes = 19 * 60 + 30; // 19:30

  const isSunday = dayOfWeek === 0;
  const isOpen = !isSunday && totalMinutes >= openMinutes && totalMinutes < closeMinutes;
  const isClosingSoon = isOpen && totalMinutes >= isClosingSoonMinutes;

  let statusLabelKey = isOpen ? 'openNow' : 'closedNow';
  let statusDetailKey = '';

  if (isOpen) {
    statusDetailKey = isClosingSoon ? 'closingSoon' : 'closesAt';
  } else {
    if (isSunday) {
      statusDetailKey = 'opensMondayAt';
    } else if (totalMinutes < openMinutes) {
      statusDetailKey = 'opensTodayAt';
    } else if (dayOfWeek === 6 && totalMinutes >= closeMinutes) {
      // Saturday evening
      statusDetailKey = 'opensMondayAt';
    } else {
      // Mon-Fri evening
      statusDetailKey = 'opensTomorrowAt';
    }
  }

  const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  return {
    isOpen,
    isClosingSoon,
    dayOfWeek,
    dayName: weekdayStr,
    hour,
    minute,
    timeString,
    statusLabelKey,
    statusDetailKey
  };
}

export const OpeningStatus: React.FC<OpeningStatusProps> = ({
  className = '',
  variant = 'navbar'
}) => {
  const { t, language } = useLanguage();
  const [status, setStatus] = useState<ParisTimeInfo>(computeParisStatus);
  const [isOpenPopover, setIsOpenPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Re-check every 15 seconds to keep status in sync in real time
  useEffect(() => {
    setStatus(computeParisStatus());
    const interval = setInterval(() => {
      setStatus(computeParisStatus());
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpenPopover(false);
      }
    }
    if (isOpenPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpenPopover]);

  const daysWeekTranslations = [
    { id: 1, fr: 'Lundi', en: 'Monday', zh: '周一', hours: '10h00 - 20h00' },
    { id: 2, fr: 'Mardi', en: 'Tuesday', zh: '周二', hours: '10h00 - 20h00' },
    { id: 3, fr: 'Mercredi', en: 'Wednesday', zh: '周三', hours: '10h00 - 20h00' },
    { id: 4, fr: 'Jeudi', en: 'Thursday', zh: '周四', hours: '10h00 - 20h00' },
    { id: 5, fr: 'Vendredi', en: 'Friday', zh: '周五', hours: '10h00 - 20h00' },
    { id: 6, fr: 'Samedi', en: 'Saturday', zh: '周六', hours: '10h00 - 20h00' },
    { id: 0, fr: 'Dimanche', en: 'Sunday', zh: '周日', hours: t('closed') }
  ];

  const getDayName = (day: typeof daysWeekTranslations[0]) => {
    if (language === 'zh') return day.zh;
    if (language === 'en') return day.en;
    return day.fr;
  };

  const statusLabel = t(status.statusLabelKey) || (status.isOpen ? 'Ouvert' : 'Fermé');
  const statusDetail = t(status.statusDetailKey) || '';

  // Compact variant (for mobile or tight spots)
  if (variant === 'compact') {
    return (
      <div className={`relative inline-block ${className}`} ref={popoverRef}>
        <button
          type="button"
          onClick={() => setIsOpenPopover(!isOpenPopover)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide transition-all select-none ${
            status.isOpen
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
          }`}
          title={`${statusLabel} • ${COMPANY_INFO.schedule}`}
          aria-label="Statut d'ouverture"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            {status.isOpen && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                status.isOpen ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            ></span>
          </span>
          <span>{statusLabel}</span>
        </button>

        {isOpenPopover && (
          <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-purple-150 p-4 z-50 animate-fade-in text-slate-800 text-left">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
              <span className="font-extrabold text-sm text-slate-900">{t('openingScheduleTitle')}</span>
              <span className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-bold">
                {status.timeString} Paris
              </span>
            </div>
            <div className="space-y-1 text-xs">
              {daysWeekTranslations.map((day) => {
                const isToday = day.id === status.dayOfWeek;
                return (
                  <div
                    key={day.id}
                    className={`flex justify-between py-1 px-2 rounded-lg ${
                      isToday
                        ? 'bg-purple-50 text-purple-900 font-bold border border-purple-200/80'
                        : 'text-gray-600'
                    }`}
                  >
                    <span>{getDayName(day)} {isToday && '•'}</span>
                    <span className={day.id === 0 ? 'text-rose-500 font-semibold' : ''}>
                      {day.hours}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 flex gap-2">
              <Link
                to="/reservation"
                onClick={() => setIsOpenPopover(false)}
                className="flex-1 text-center bg-primary hover:bg-accent text-white text-xs font-bold py-1.5 px-3 rounded-lg transition"
              >
                {t('bookAppointment')}
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full / Navbar variant (desktop primary navbar)
  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      <button
        type="button"
        id="opening-status-button"
        onClick={() => setIsOpenPopover(!isOpenPopover)}
        className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-sm border ${
          status.isOpen
            ? 'bg-emerald-50/90 hover:bg-emerald-100 text-emerald-900 border-emerald-300/80 shadow-emerald-500/5'
            : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/90'
        }`}
        title={`${statusLabel} : ${statusDetail}`}
        aria-haspopup="dialog"
        aria-expanded={isOpenPopover}
      >
        {/* Pulsing Dot */}
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          {status.isOpen && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              status.isOpen ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          ></span>
        </span>

        {/* Live Status Label */}
        <span className="font-bold text-[12px]">{statusLabel}</span>

        {/* Contextual Sub-detail */}
        <span
          className={`hidden xl:inline-block text-[11px] font-medium border-l pl-2 ${
            status.isOpen ? 'border-emerald-200 text-emerald-700' : 'border-slate-300 text-slate-500'
          }`}
        >
          {statusDetail}
        </span>

        {/* Dropdown Chevron */}
        <ChevronDown
          size={13}
          className={`text-gray-400 transition-transform duration-200 ${
            isOpenPopover ? 'rotate-180 text-primary' : 'group-hover:text-gray-600'
          }`}
        />
      </button>

      {/* Popover Card */}
      {isOpenPopover && (
        <div
          id="opening-status-popover"
          className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2.5 w-80 bg-white rounded-2xl shadow-2xl border border-purple-100/90 p-4 z-50 animate-fade-in text-slate-800 text-left"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3 mb-3 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                  {COMPANY_INFO.name}
                </span>
                <Sparkles className="w-3 h-3 text-amber-500" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 mt-0.5">
                {t('salonStatusTitle')}
              </h4>
            </div>

            {/* Current Paris Time badge */}
            <div className="flex items-center gap-1 bg-purple-50 text-purple-900 px-2.5 py-1 rounded-lg border border-purple-200/60 font-mono text-[11px] font-bold shrink-0">
              <Clock className="w-3 h-3 text-purple-600" />
              <span>{status.timeString}</span>
            </div>
          </div>

          {/* Current Status Banner */}
          <div
            className={`p-3 rounded-xl mb-3.5 flex items-center gap-3 ${
              status.isOpen
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border border-slate-200 text-slate-800'
            }`}
          >
            {status.isOpen ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
            )}
            <div className="text-xs">
              <p className="font-black text-sm leading-tight">
                {statusLabel} actuellement
              </p>
              <p className="text-[11px] opacity-80 mt-0.5 font-medium">
                {statusDetail} &bull; 50 rue Popincourt, Paris 11
              </p>
            </div>
          </div>

          {/* Weekly Schedule list */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1">
              <span>{t('openingScheduleTitle')}</span>
              <span>{t('hours')}</span>
            </div>
            <div className="space-y-1 text-xs">
              {daysWeekTranslations.map((day) => {
                const isToday = day.id === status.dayOfWeek;
                return (
                  <div
                    key={day.id}
                    className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg transition-colors ${
                      isToday
                        ? 'bg-purple-100/70 text-purple-950 font-bold border border-purple-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400/60"></span>
                      <span>{getDayName(day)}</span>
                      {isToday && (
                        <span className="text-[9px] uppercase px-1.5 py-0.2 bg-purple-600 text-white rounded font-extrabold tracking-wider">
                          Aujourd'hui
                        </span>
                      )}
                    </div>
                    <span
                      className={`font-medium ${
                        day.id === 0 ? 'text-rose-600 font-semibold' : 'text-slate-800'
                      }`}
                    >
                      {day.hours}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions in Popover */}
          <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
            <Link
              to="/reservation"
              onClick={() => setIsOpenPopover(false)}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-bold py-2 px-3 rounded-xl text-center shadow-md transition transform hover:-translate-y-0.5"
            >
              {t('bookAppointment')}
            </Link>
            <a
              href={`tel:${COMPANY_INFO.phone.replace(/ /g, '')}`}
              className="p-2 bg-gray-100 hover:bg-purple-50 text-gray-700 hover:text-primary rounded-xl border border-gray-200 transition"
              title={`Appeler : ${COMPANY_INFO.phone}`}
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
