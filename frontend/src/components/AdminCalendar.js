import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Plus, Trash2, MapPin, Clock, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
const WEEKDAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const PHOTOGRAPHER_COLORS = {
  gonzalo: { bg: '#9C6AB0', label: 'Gonzalo' },
  manuel: { bg: '#5B7B9A', label: 'Manuel' },
  alvaro: { bg: '#7A9A5B', label: 'Álvaro' },
};

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const AdminCalendar = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(formatDate(today));
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    time: '',
    location: '',
    description: '',
    photographer: 'gonzalo',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get(`${API}/events`, { withCredentials: true });
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(
        `${API}/events`,
        { ...formData, date: selectedDate },
        { withCredentials: true }
      );
      toast.success('Evento añadido');
      setFormData({ title: '', time: '', location: '', description: '', photographer: 'gonzalo' });
      setShowForm(false);
      fetchEvents();
    } catch (error) {
      toast.error('Error al añadir el evento');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (eventId) => {
    try {
      await axios.delete(`${API}/events/${eventId}`, { withCredentials: true });
      toast.success('Evento eliminado');
      fetchEvents();
    } catch (error) {
      toast.error('Error al eliminar el evento');
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Generate calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  // Monday=0, Sunday=6 (European format)
  const firstWeekday = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstWeekday; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  // Events grouped by date string
  const eventsByDate = events.reduce((acc, ev) => {
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push(ev);
    return acc;
  }, {});

  const selectedDayEvents = eventsByDate[selectedDate] || [];
  const todayStr = formatDate(today);

  return (
    <div className="grid lg:grid-cols-3 gap-8" data-testid="admin-calendar">
      {/* Calendar */}
      <div className="lg:col-span-2 bg-[#1A171D] border border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-medium">
            {MONTHS_ES[currentMonth]} {currentYear}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={prevMonth}
              className="p-2 text-[#AFA8B3] hover:text-[#F8F7F9] border border-[#2C2631] hover:border-[#9C6AB0] transition-colors"
              data-testid="calendar-prev-month"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => {
                const t = new Date();
                setCurrentMonth(t.getMonth());
                setCurrentYear(t.getFullYear());
                setSelectedDate(formatDate(t));
              }}
              className="px-3 py-2 text-sm text-[#AFA8B3] hover:text-[#F8F7F9] border border-[#2C2631] hover:border-[#9C6AB0] transition-colors"
              data-testid="calendar-today"
            >
              Hoy
            </button>
            <button
              onClick={nextMonth}
              className="p-2 text-[#AFA8B3] hover:text-[#F8F7F9] border border-[#2C2631] hover:border-[#9C6AB0] transition-colors"
              data-testid="calendar-next-month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS_ES.map((wd) => (
            <div key={wd} className="text-center text-xs tracking-[0.2em] uppercase text-[#AFA8B3] py-2">
              {wd}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;
            const dateStr = formatDate(new Date(currentYear, currentMonth, day));
            const dayEvents = eventsByDate[dateStr] || [];
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr;
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={`aspect-square p-2 border transition-colors text-left relative ${
                  isSelected
                    ? 'border-[#9C6AB0] bg-[#252129]'
                    : 'border-[#2C2631] hover:border-[#9C6AB0]/50 bg-[#1A171D]'
                }`}
                data-testid={`calendar-day-${dateStr}`}
              >
                <span className={`text-sm ${isToday ? 'text-[#9C6AB0] font-bold' : 'text-[#F8F7F9]'}`}>
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-1 left-1 right-1 flex gap-0.5 justify-center">
                    {dayEvents.slice(0, 3).map((ev, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: PHOTOGRAPHER_COLORS[ev.photographer]?.bg || '#9C6AB0' }}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[8px] text-[#AFA8B3]">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-[#2C2631] flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PHOTOGRAPHER_COLORS.gonzalo.bg }} />
            <span className="text-[#AFA8B3]">Gonzalo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PHOTOGRAPHER_COLORS.manuel.bg }} />
            <span className="text-[#AFA8B3]">Manuel</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#7A9A5B' }}></div>
              <span className="text-[#AFA8B3]">Álvaro</span>
          </div>
        </div>
      </div>

      {/* Day Detail */}
      <div className="bg-[#1A171D] border border-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
          </h3>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1 bg-[#522A4E] hover:bg-[#6D3B68] text-white px-3 py-1.5 text-sm transition-colors"
              data-testid="calendar-add-event-button"
            >
              <Plus size={16} />
              Añadir
            </button>
          )}
        </div>

        {/* Add Event Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-3 mb-6 pb-6 border-b border-[#2C2631]" data-testid="event-form">
            <div className="flex justify-between items-center">
              <p className="text-xs tracking-[0.2em] uppercase text-[#9C6AB0]">Nuevo Evento</p>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-[#AFA8B3] hover:text-[#F8F7F9]"
                data-testid="event-form-close"
              >
                <X size={16} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Título *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-3 py-2 text-sm focus:outline-none focus:border-[#9C6AB0]"
              data-testid="event-title-input"
            />
            <input
              type="time"
              placeholder="Hora"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-3 py-2 text-sm focus:outline-none focus:border-[#9C6AB0]"
              data-testid="event-time-input"
            />
            <input
              type="text"
              placeholder="Lugar"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-3 py-2 text-sm focus:outline-none focus:border-[#9C6AB0]"
              data-testid="event-location-input"
            />
            <textarea
              placeholder="Descripción / notas"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-3 py-2 text-sm focus:outline-none focus:border-[#9C6AB0] resize-none"
              data-testid="event-description-input"
            />
            <select
              value={formData.photographer}
              onChange={(e) => setFormData({ ...formData, photographer: e.target.value })}
              className="w-full bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-3 py-2 text-sm focus:outline-none focus:border-[#9C6AB0]"
              data-testid="event-photographer-select"
            >
              <option value="gonzalo">Gonzalo</option>
              <option value="manuel">Manuel</option>
              <option value="alvaro">Álvaro</option>
            </select>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#522A4E] hover:bg-[#6D3B68] disabled:bg-[#252129] text-white py-2 text-sm transition-colors"
              data-testid="event-submit-button"
            >
              {submitting ? 'Guardando...' : 'Guardar Evento'}
            </button>
          </form>
        )}

        {/* Events list for selected day */}
        {selectedDayEvents.length === 0 ? (
          <p className="text-sm text-[#AFA8B3] text-center py-8" data-testid="no-events-message">
            Sin eventos en este día
          </p>
        ) : (
          <div className="space-y-3">
            {selectedDayEvents.map((ev) => (
              <div
                key={ev.id}
                className="border-l-4 bg-[#252129] p-3 group"
                style={{ borderLeftColor: PHOTOGRAPHER_COLORS[ev.photographer]?.bg || '#9C6AB0' }}
                data-testid={`event-${ev.id}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{ev.title}</h4>
                    <p className="text-xs text-[#9C6AB0] mt-0.5">
                      {PHOTOGRAPHER_COLORS[ev.photographer]?.label}
                    </p>
                    {ev.time && (
                      <p className="text-xs text-[#AFA8B3] flex items-center gap-1 mt-1">
                        <Clock size={11} />
                        {ev.time}
                      </p>
                    )}
                    {ev.location && (
                      <p className="text-xs text-[#AFA8B3] flex items-center gap-1 mt-1">
                        <MapPin size={11} />
                        {ev.location}
                      </p>
                    )}
                    {ev.description && (
                      <p className="text-xs text-[#AFA8B3] mt-1.5">{ev.description}</p>
                    )}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="text-[#AFA8B3] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        data-testid={`delete-event-${ev.id}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#1A171D] border-[#2C2631] text-[#F8F7F9]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar este evento?</AlertDialogTitle>
                        <AlertDialogDescription className="text-[#AFA8B3]">
                          Se eliminará <strong>{ev.title}</strong> del calendario.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-[#252129] border-[#2C2631] text-[#F8F7F9] hover:bg-[#2C2631]">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(ev.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCalendar;