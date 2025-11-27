import type { Sala, Aula, StatusSalaCalculado } from "./types"

// Helper function to convert time string to minutes
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

// Check if a date falls within the academic year period
const isDateInAcademicPeriod = (date: Date, dataInicio: string, dataFim: string): boolean => {
  const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const inicio = new Date(dataInicio)
  const fim = new Date(dataFim)
  return checkDate >= inicio && checkDate <= fim
}

// Check if a room is occupied at a specific date and time
export const isRoomOccupiedAt = (
  sala: Sala,
  aulas: Aula[],
  date: Date,
  horaInicio?: string,
  horaFim?: string,
): { occupied: boolean; aulaOcupando?: Aula } => {
  const diaSemana = date.getDay()

  for (const aula of aulas) {
    if (aula.status === "cancelada") continue

    // Check if date is within academic period
    if (!isDateInAcademicPeriod(date, aula.dataInicioAnoLetivo, aula.dataFimAnoLetivo)) continue

    // Check all room assignments for this class
    const salasIds = aula.salasAtribuicoes?.map((a) => a.salaId) || [aula.salaId]
    if (!salasIds.includes(sala.id)) continue

    // Check if any schedule matches this day
    for (const horario of aula.horarios) {
      if (horario.diaSemana !== diaSemana) continue

      // If no specific time provided, just check if there's any class on this day
      if (!horaInicio || !horaFim) {
        return { occupied: true, aulaOcupando: aula }
      }

      // Check time overlap
      const aulaInicio = timeToMinutes(horario.horaInicio)
      const aulaFim = timeToMinutes(horario.horaFim)
      const checkInicio = timeToMinutes(horaInicio)
      const checkFim = timeToMinutes(horaFim)

      if (checkInicio < aulaFim && checkFim > aulaInicio) {
        return { occupied: true, aulaOcupando: aula }
      }
    }
  }

  return { occupied: false }
}

// Get the calculated status of a room at a specific moment
export const getCalculatedRoomStatus = (
  sala: Sala,
  aulas: Aula[],
  date: Date = new Date(),
  horaInicio?: string,
  horaFim?: string,
): StatusSalaCalculado => {
  // Manual status takes precedence for maintenance and unavailable
  if (sala.statusManual === "manutencao") return "manutencao"
  if (sala.statusManual === "indisponivel") return "indisponivel"

  // Check if room is occupied by scheduled classes
  const { occupied } = isRoomOccupiedAt(sala, aulas, date, horaInicio, horaFim)
  if (occupied) return "ocupada"

  return "disponivel"
}

// Get current status (real-time)
export const getCurrentRoomStatus = (sala: Sala, aulas: Aula[]): StatusSalaCalculado => {
  const now = new Date()
  const currentHour = now.getHours().toString().padStart(2, "0")
  const currentMinute = now.getMinutes().toString().padStart(2, "0")
  const currentTime = `${currentHour}:${currentMinute}`
  const endTime = `${(now.getHours() + 1).toString().padStart(2, "0")}:${currentMinute}`

  return getCalculatedRoomStatus(sala, aulas, now, currentTime, endTime)
}

// Get classes occupying a room on a specific day
export const getClassesForRoomOnDay = (
  sala: Sala,
  aulas: Aula[],
  date: Date,
): { aula: Aula; horario: { horaInicio: string; horaFim: string } }[] => {
  const diaSemana = date.getDay()
  const result: { aula: Aula; horario: { horaInicio: string; horaFim: string } }[] = []

  for (const aula of aulas) {
    if (aula.status === "cancelada") continue
    if (!isDateInAcademicPeriod(date, aula.dataInicioAnoLetivo, aula.dataFimAnoLetivo)) continue

    const salasIds = aula.salasAtribuicoes?.map((a) => a.salaId) || [aula.salaId]
    if (!salasIds.includes(sala.id)) continue

    for (const horario of aula.horarios) {
      if (horario.diaSemana === diaSemana) {
        result.push({
          aula,
          horario: { horaInicio: horario.horaInicio, horaFim: horario.horaFim },
        })
      }
    }
  }

  return result.sort((a, b) => timeToMinutes(a.horario.horaInicio) - timeToMinutes(b.horario.horaInicio))
}

// Check if a room is available for scheduling (considers manual status)
export const isRoomAvailableForScheduling = (
  sala: Sala,
  aulas: Aula[],
  diasSemana: number[],
  horaInicio: string,
  horaFim: string,
  dataInicioAnoLetivo: string,
  dataFimAnoLetivo: string,
  excludeAulaId?: string,
): { available: boolean; conflicts: { diaSemana: number; aula: string; horario: string }[] } => {
  // Manual status blocks scheduling
  if (sala.statusManual === "manutencao" || sala.statusManual === "indisponivel") {
    return { available: false, conflicts: [] }
  }

  const conflicts: { diaSemana: number; aula: string; horario: string }[] = []

  // Create a reference date within the academic period to check
  const startDate = new Date(dataInicioAnoLetivo)

  for (const diaSemana of diasSemana) {
    // Find a date that matches this day of week within the period
    const checkDate = new Date(startDate)
    while (checkDate.getDay() !== diaSemana) {
      checkDate.setDate(checkDate.getDate() + 1)
    }

    const { occupied, aulaOcupando } = isRoomOccupiedAt(
      sala,
      aulas.filter((a) => a.id !== excludeAulaId),
      checkDate,
      horaInicio,
      horaFim,
    )

    if (occupied && aulaOcupando) {
      const horarioConflito = aulaOcupando.horarios.find((h) => h.diaSemana === diaSemana)
      if (horarioConflito) {
        conflicts.push({
          diaSemana,
          aula: aulaOcupando.disciplina,
          horario: `${horarioConflito.horaInicio} - ${horarioConflito.horaFim}`,
        })
      }
    }
  }

  return { available: conflicts.length === 0, conflicts }
}
