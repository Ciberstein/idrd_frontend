// Cálculo de rachas de reservas.
//
// Regla acordada: la racha se cuenta por DÍAS con al menos una reserva.
// Dentro de cada semana calendario (Lun–Dom) se permite 1 día de descanso;
// el 2º día perdido en la misma semana rompe la racha.
// Solo cuentan las reservas ya realizadas (fecha ≤ hoy).

function localMidnight(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// "YYYY-MM-DD" (local) a partir de un Date.
function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Parsea "YYYY-MM-DD" como fecha local a medianoche (evita corrimientos por TZ).
function parseKey(key) {
  return new Date(`${key}T00:00:00`);
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// Lunes de la semana que contiene `date` (semana Lun–Dom).
export function mondayOf(date) {
  const d = localMidnight(date);
  const offset = (d.getDay() + 6) % 7; // Dom=0 -> 6, Lun=1 -> 0, …
  return addDays(d, -offset);
}

// Racha actual y máxima a partir de las reservas.
export function computeStreaks(reservations) {
  const today = localMidnight(new Date());
  const todayKey = dateKey(today);

  // Días distintos con reserva ya realizada (fecha ≤ hoy).
  const days = new Set(
    (reservations || [])
      .map((r) => r.reservation_date)
      .filter((k) => k && k <= todayKey)
  );

  if (days.size === 0) return { current: 0, longest: 0 };

  const firstKey = [...days].sort()[0];
  let cursor = parseKey(firstKey);

  let longest = 0;
  let run = 0;
  let weekMisses = 0;
  let prevWeek = null;

  while (cursor <= today) {
    const wk = dateKey(mondayOf(cursor));
    if (wk !== prevWeek) {
      weekMisses = 0; // nueva semana: se recupera el día de descanso
      prevWeek = wk;
    }

    const key = dateKey(cursor);
    if (days.has(key)) {
      run += 1;
      if (run > longest) longest = run;
    } else if (key !== todayKey) {
      // Hoy sin reserva no penaliza (el día aún no termina).
      weekMisses += 1;
      if (weekMisses >= 2) run = 0; // 2ª falta en la semana: rompe
      // 1ª falta = día de descanso: la racha se mantiene sin sumar.
    }

    cursor = addDays(cursor, 1);
  }

  return { current: run, longest };
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Reservas por semana (Lun–Dom) en las últimas `weeks` semanas, incluida la actual.
export function reservationsPerWeek(reservations, weeks = 12) {
  const thisMonday = mondayOf(new Date());

  const buckets = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = addDays(thisMonday, -7 * i);
    buckets.push({
      key: dateKey(start),
      label: `${start.getDate()} ${MONTHS[start.getMonth()]}`,
      count: 0,
    });
  }

  const firstKey = buckets[0].key;
  const byKey = new Map(buckets.map((b) => [b.key, b]));

  for (const r of reservations || []) {
    if (!r.reservation_date) continue;
    const wkKey = dateKey(mondayOf(parseKey(r.reservation_date)));
    if (wkKey < firstKey) continue; // fuera de la ventana
    const bucket = byKey.get(wkKey);
    if (bucket) bucket.count += 1;
  }

  return buckets;
}
