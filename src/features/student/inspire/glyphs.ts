import type { Component } from 'vue'
import { Award, Bot, Camera, Coffee, Droplet, FlaskConical, KeyRound, Mic, Radio, Rocket, Smile, Sparkles, Star, Sticker, Ticket, Clapperboard, Stamp, Music } from 'lucide-vue-next'

/** Icons the stories refer to by name (cast and souvenirs). */
export const GLYPHS: Record<string, Component> = {
  bot: Bot,
  rocket: Rocket,
  radio: Radio,
  coffee: Coffee,
  camera: Camera,
  mic: Mic,
  flask: FlaskConical,
  smile: Smile,
  sparkles: Sparkles,
  key: KeyRound,
  star: Star,
  ticket: Ticket,
  clapper: Clapperboard,
  note: Music,
  drop: Droplet,
  stamp: Stamp,
  sticker: Sticker,
  award: Award,
}
