/**
 * Shared utility functions for lead management
 */
import { LEAD_STATUSES, SOURCE_CHANNELS, SCORE_THRESHOLDS } from "@/constants/leadConstants";

export function getStatusColor(status: string): string {
  switch (status) {
    case LEAD_STATUSES.NEW_CONTACT:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case LEAD_STATUSES.FIRST_CONTACT:
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    case LEAD_STATUSES.QUALIFICATION:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case LEAD_STATUSES.PRESENTATION:
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case LEAD_STATUSES.NEGOTIATION:
      return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300";
    case LEAD_STATUSES.CONTRACT:
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case LEAD_STATUSES.CLOSED_WON:
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
    case LEAD_STATUSES.CLOSED_LOST:
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
}

export function getScoreColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.HIGH) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
  if (score >= SCORE_THRESHOLDS.MEDIUM) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
  if (score >= SCORE_THRESHOLDS.LOW) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
  return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case LEAD_STATUSES.NEW_CONTACT:
      return "Nuevo Contacto";
    case LEAD_STATUSES.FIRST_CONTACT:
      return "Primer Contacto";
    case LEAD_STATUSES.QUALIFICATION:
      return "Calificación";
    case LEAD_STATUSES.PRESENTATION:
      return "Presentación";
    case LEAD_STATUSES.NEGOTIATION:
      return "Negociación";
    case LEAD_STATUSES.CONTRACT:
      return "Contrato";
    case LEAD_STATUSES.CLOSED_WON:
      return "Ganado";
    case LEAD_STATUSES.CLOSED_LOST:
      return "Perdido";
    default:
      return status;
  }
}

export function getSourceChannelLabel(source: string | undefined): string {
  if (!source) return "Desconocido";
  
  switch (source) {
    case SOURCE_CHANNELS.WEBSITE:
      return "Sitio Web";
    case SOURCE_CHANNELS.REFERRAL:
      return "Referido";
    case SOURCE_CHANNELS.SOCIAL_MEDIA:
      return "Redes Sociales";
    case SOURCE_CHANNELS.EMAIL:
      return "Email";
    case SOURCE_CHANNELS.PHONE:
      return "Teléfono";
    case SOURCE_CHANNELS.EVENT:
      return "Evento";
    case SOURCE_CHANNELS.OTHER:
      return "Otro";
    default:
      return source;
  }
}