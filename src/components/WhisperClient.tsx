"use client"

import { useEffect, useRef, useState } from "react"
import MicrophoneRecorder from "./MicrophoneRecorder"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function WhisperClient() {
  const workerRef = useRef<Worker | null>(null)
  const [status, setStatus] = useState("Initializing...")
  const [transcript, setTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let worker: Worker | null = null

    const initializeWorker = () => {
      try {
        // Fix the path - use singular "whisperWorker.js"
        worker = new Worker("/whisper/worker/whisperWorker.js")
        workerRef.current = worker

        worker.onmessage = (e) => {
          const { type, text, error: workerError } = e.data

          console.log("Received message from worker:", { type, text, error: workerError })

          switch (type) {
            case "READY":
              setStatus("Ready")
              setError(null)
              break
            case "TRANSCRIPT":
              setTranscript(text)
              setStatus("Ready")
              setIsProcessing(false)
              setError(null)
              break
            case "ERROR":
              console.error("Worker error:", workerError)
              setStatus("Error")
              setError(workerError)
              setIsProcessing(false)
              break
            default:
              console.warn("Unknown message type:", type)
          }
        }

        worker.onerror = (e) => {
          console.error("Worker crashed:", e)
          setStatus("Worker Error")
          setError(`Worker crashed: ${e.message || "Unknown error"}`)
          setIsProcessing(false)
        }

        // Set a timeout to check if worker initializes
        setTimeout(() => {
          if (status === "Initializing...") {
            setStatus("Warning: Slow initialization")
            setError("Worker is taking longer than expected to initialize. WASM files may be missing.")
          }
        }, 5000)
      } catch (err) {
        console.error("Failed to create worker:", err)
        setStatus("Failed to initialize")
        setError(`Failed to create worker: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    initializeWorker()

    return () => {
      if (worker) {
        worker.terminate()
      }
    }
  }, [])

  const handleAudioData = async (audioBlob: Blob) => {
    if (!workerRef.current) {
      setError("Worker not available")
      return
    }

    if (status !== "Ready") {
      setError("Worker not ready")
      return
    }

    try {
      setIsProcessing(true)
      setStatus("Processing...")
      setError(null)

      const buffer = await audioBlob.arrayBuffer()

      workerRef.current.postMessage({
        type: "TRANSCRIBE",
        audioBuffer: buffer,
      })
    } catch (err) {
      console.error("Error processing audio:", err)
      setError(`Error processing audio: ${err instanceof Error ? err.message : String(err)}`)
      setIsProcessing(false)
      setStatus("Ready")
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">AI Voice Assistant</h1>
        <p className="text-muted-foreground">Powered by Whisper WASM</p>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <p>
          Status:{" "}
          <span
            className={`font-medium ${status === "Ready" ? "text-green-600" : status.includes("Error") ? "text-red-600" : "text-blue-600"}`}
          >
            {status}
          </span>
        </p>
        {isProcessing && (
          <div className="mt-2 flex animate-pulse space-x-1">
            {[0, 0.1, 0.2].map((delay, i) => (
              <div
                key={i}
                className="h-2 w-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <MicrophoneRecorder onAudioRecorded={handleAudioData} disabled={status !== "Ready" || isProcessing} />

      {transcript && (
        <div className="p-4 bg-card border rounded-lg">
          <h3 className="font-semibold mb-2">Transcript:</h3>
          <p className="text-sm">{transcript}</p>
        </div>
      )}
    </div>
  )
}
