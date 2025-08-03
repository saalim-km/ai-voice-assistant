"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Square, Loader2 } from "lucide-react"

interface MicrophoneRecorderProps {
  onAudioRecorded: (audioBlob: Blob) => void
  disabled?: boolean
}

const MicrophoneRecorder: React.FC<MicrophoneRecorderProps> = ({ onAudioRecorded, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
        video: false,
      })

      streamRef.current = stream
      audioChunks.current = []

      const options = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? { mimeType: "audio/webm;codecs=opus" }
        : {}

      mediaRecorder.current = new MediaRecorder(stream, options)

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data)
        }
      }

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, {
          type: mediaRecorder.current?.mimeType || "audio/webm",
        })

        onAudioRecorded(audioBlob)

        streamRef.current?.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      mediaRecorder.current.start(1000)
    } catch (error) {
      console.error("Error starting recording:", error)
      alert("Could not access microphone. Please check permissions.")
    }
  }

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop()
    }

    setIsRecording(false)
    setRecordingTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold">Voice Recording</h2>
          {isRecording && <div className="text-sm text-muted-foreground">Recording: {formatTime(recordingTime)}</div>}
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={startRecording} disabled={isRecording || disabled} size="lg" className="min-w-[120px]">
            {disabled ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mic className="w-4 h-4 mr-2" />}
            {isRecording ? "Recording..." : "Start"}
          </Button>

          <Button
            onClick={stopRecording}
            disabled={!isRecording}
            variant="destructive"
            size="lg"
            className="min-w-[120px]"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        </div>

        {isRecording && (
          <div className="flex justify-center">
            <div className="flex space-x-1">
              {[0, 0.2, 0.4].map((delay, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default MicrophoneRecorder
