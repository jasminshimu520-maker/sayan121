import React, { useState } from 'react';
import { Task } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onScheduleForDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  selectedDate,
  onSelectDate,
  onScheduleForDate,
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    return new Date();
  });

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed

  // Today formatted YYYY-MM-DD
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`;

  // Month navigation
  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    const now = new Date();
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
    onSelectDate(todayStr);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Bengali Month Names subtitle for localization touch
  const banglaMonthNames = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  // Calendar math
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Tasks grouped by target_date
  const taskMap = new Map<string, Task[]>();
  tasks.forEach((task) => {
    const list = taskMap.get(task.target_date) || [];
    list.push(task);
    taskMap.set(task.target_date, list);
  });

  // Build grid days
  interface DayCell {
    dayNumber: number;
    dateStr: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    tasks: Task[];
  }

  const cells: DayCell[] = [];

  // Trailing previous month days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevDate = new Date(year, month - 1, d);
    const dateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDate,
      tasks: taskMap.get(dateStr) || [],
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDate,
      tasks: taskMap.get(dateStr) || [],
    });
  }

  // Leading next month days to complete 35 or 42 grid cells
  const remainingCells = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nextDate = new Date(year, month + 1, d);
    const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDate,
      tasks: taskMap.get(dateStr) || [],
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      {/* Month Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-slate-500">{banglaMonthNames[month]} {year}</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={jumpToToday}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            Today
          </button>
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-2xs"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-2xs"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-b border-slate-100 text-center bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider py-2">
        <span className="text-rose-500">Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span className="text-indigo-600">Sat</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-px bg-slate-100 p-px">
        {cells.map((cell, idx) => {
          const hasTasks = cell.tasks.length > 0;
          const completedCount = cell.tasks.filter((t) => t.is_completed === 1).length;
          const isAllCompleted = hasTasks && completedCount === cell.tasks.length;

          return (
            <div
              key={idx}
              onClick={() => {
                onSelectDate(cell.dateStr);
              }}
              onDoubleClick={() => {
                onScheduleForDate(cell.dateStr);
              }}
              className={`min-h-[72px] sm:min-h-[88px] p-1.5 sm:p-2 bg-white flex flex-col justify-between transition-all cursor-pointer relative group ${
                cell.isSelected ? 'ring-2 ring-indigo-500 ring-inset bg-indigo-50/20' : ''
              } ${!cell.isCurrentMonth ? 'bg-slate-50/60 opacity-40' : 'hover:bg-slate-50'}`}
            >
              {/* Top row: day number + today badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs sm:text-sm font-semibold rounded-full w-6 h-6 flex items-center justify-center transition-colors ${
                    cell.isToday
                      ? 'bg-indigo-600 text-white font-bold shadow-sm'
                      : cell.isSelected
                      ? 'bg-indigo-100 text-indigo-900 font-bold'
                      : 'text-slate-700'
                  }`}
                >
                  {cell.dayNumber}
                </span>

                {/* Quick Add Button on Hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onScheduleForDate(cell.dateStr);
                  }}
                  className="opacity-0 group-hover:opacity-100 sm:p-0.5 rounded text-indigo-600 hover:bg-indigo-100 transition-opacity"
                  title="Schedule task on this date"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tasks Indicators */}
              <div className="mt-1 space-y-1 overflow-hidden">
                {cell.tasks.slice(0, 2).map((t) => (
                  <div
                    key={t.id}
                    className={`text-[10px] leading-tight px-1.5 py-0.5 rounded truncate font-medium flex items-center space-x-1 ${
                      t.is_completed === 1
                        ? 'line-through bg-slate-100 text-slate-400'
                        : t.priority === 'high'
                        ? 'bg-rose-50 text-rose-700 border-l-2 border-rose-500'
                        : t.priority === 'medium'
                        ? 'bg-amber-50 text-amber-700 border-l-2 border-amber-500'
                        : 'bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500'
                    }`}
                    title={t.title}
                  >
                    <span className="truncate">{t.title}</span>
                  </div>
                ))}

                {cell.tasks.length > 2 && (
                  <div className="text-[9px] font-bold text-indigo-600 text-center bg-indigo-50/80 rounded py-0.5">
                    +{cell.tasks.length - 2} more
                  </div>
                )}
              </div>

              {/* Scheduled indicator dot if tasks present */}
              {hasTasks && (
                <div className="absolute bottom-1 right-1.5 flex space-x-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isAllCompleted ? 'bg-slate-400' : 'bg-indigo-500 animate-pulse'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Footer Prompt */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>High Priority</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Medium</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Low</span>
          </span>
        </div>
        <div className="text-[11px] text-slate-600">
          💡 Click any date to view tasks, or double-click to schedule!
        </div>
      </div>
    </div>
  );
};
