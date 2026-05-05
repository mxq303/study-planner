'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Volume2, VolumeX, CloudRain, Trees, Waves, Wind } from 'lucide-react'
import { cn } from '@/lib/utils'

type SoundType = 'white-noise' | 'rain' | 'forest' | 'ocean'

const soundOptions: { type: SoundType; label: string; icon: typeof Volume2 }[] = [
  { type: 'white-noise', label: '白噪音', icon: Wind },
  { type: 'rain', label: '雨声', icon: CloudRain },
  { type: 'forest', label: '森林', icon: Trees },
  { type: 'ocean', label: '海浪', icon: Waves },
]

export function WhiteNoise() {
  const [playing, setPlaying] = useState(false)
  const [soundType, setSoundType] = useState<SoundType>('white-noise')
  const [volume, setVolume] = useState(() => {
    if (typeof window === 'undefined') return 0.5
    return parseFloat(localStorage.getItem('whitenoise_volume') || '0.5')
  })
  const [showPanel, setShowPanel] = useState(false)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)

  const createNoiseBuffer = useCallback((ctx: AudioContext, type: SoundType): AudioBuffer => {
    const bufferSize = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      let sample = Math.random() * 2 - 1

      switch (type) {
        case 'rain': {
          const t = i / ctx.sampleRate
          // Simulate rain: filtered noise with occasional louder drops
          const drop = Math.sin(t * 40) > 0.98 ? (Math.random() * 2 - 1) * 0.5 : 0
          sample = (sample * 0.3 + drop) * 0.7
          break
        }
        case 'forest': {
          // Higher frequency noise with bird-like chirps
          const chirp = Math.sin(i * 0.01) * Math.sin(i * 0.0005)
          sample = sample * 0.5 + (chirp > 0.3 ? chirp * 0.2 : 0)
          sample *= 0.6
          break
        }
        case 'ocean': {
          // Low frequency, slow amplitude modulation
          const mod = 0.5 + 0.5 * Math.sin(i / ctx.sampleRate * 0.3)
          sample = sample * mod * 0.8
          break
        }
        case 'white-noise':
        default:
          sample *= 0.5
      }
      data[i] = sample
    }
    return buffer
  }, [])

  const startNoise = useCallback((type: SoundType, vol: number) => {
    try {
      const ctx = new AudioContext()
      audioCtxRef.current = ctx

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(vol, ctx.currentTime)
      gain.connect(ctx.destination)
      gainRef.current = gain

      const buffer = createNoiseBuffer(ctx, type)
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true
      source.connect(gain)
      source.start()
      sourceRef.current = source
    } catch {
      // Audio not supported
    }
  }, [createNoiseBuffer])

  const stopNoise = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop() } catch {}
      sourceRef.current = null
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close()
      audioCtxRef.current = null
    }
    gainRef.current = null
  }, [])

  const togglePlay = useCallback(() => {
    if (playing) {
      stopNoise()
      setPlaying(false)
    } else {
      startNoise(soundType, volume)
      setPlaying(true)
    }
  }, [playing, soundType, volume, startNoise, stopNoise])

  const changeSound = useCallback((type: SoundType) => {
    if (playing) {
      stopNoise()
      startNoise(type, volume)
    }
    setSoundType(type)
  }, [playing, volume, startNoise, stopNoise])

  const changeVolume = useCallback((v: number) => {
    setVolume(v)
    localStorage.setItem('whitenoise_volume', String(v))
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.setValueAtTime(v, audioCtxRef.current.currentTime)
    }
  }, [])

  useEffect(() => {
    return () => stopNoise()
  }, [stopNoise])

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
          playing
            ? 'bg-primary/10 text-primary border border-primary/20'
            : 'card-bg border border-border text-text-muted hover:text-text'
        )}
      >
        {playing ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        白噪音
      </button>

      {showPanel && (
        <div className="absolute bottom-full mb-2 right-0 card-bg border border-border rounded-2xl p-4 shadow-xl w-64 animate-slide-up z-10">
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {soundOptions.map(opt => (
              <button
                key={opt.type}
                onClick={() => changeSound(opt.type)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all',
                  soundType === opt.type
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-muted hover:text-text hover:bg-hover'
                )}
              >
                <opt.icon className="w-4 h-4" />
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-text-muted" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={e => changeVolume(parseFloat(e.target.value))}
              className="flex-1 h-1.5 rounded-full appearance-none bg-border [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <button
              onClick={togglePlay}
              className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                playing ? 'bg-primary text-white' : 'bg-hover text-text-muted'
              )}
            >
              {playing ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
