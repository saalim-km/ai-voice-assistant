// Web Worker for Whisper WASM processing
let isReady = false
let whisperModule = null

// Enhanced logging
const log = (message, data = null) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] WhisperWorker: ${message}`, data || "")
}

log("Worker starting initialization...")

// Define the Module object for WASM
self.Module = {
  onRuntimeInitialized: () => {
    log("Whisper WASM runtime initialized successfully")
    isReady = true
    whisperModule = self.Module
    self.postMessage({ type: "READY" })
  },
  onAbort: (what) => {
    log("WASM module aborted", what)
    self.postMessage({
      type: "ERROR",
      error: `WASM module aborted: ${what}`,
    })
  },
  print: (text) => {
    log("WASM output:", text)
  },
  printErr: (text) => {
    log("WASM error:", text)
  },
}

// Enhanced WASM loading with debugging
const loadWASM = async () => {
  try {
    log("Checking if main.js exists...")

    // Check if the main.js file exists first
    const response = await fetch("/whisper/wasm/main.js")
    if (!response.ok) {
      throw new Error(`Failed to fetch main.js: ${response.status} ${response.statusText}`)
    }

    log("main.js found, importing script...")

    // Import the script
    self.importScripts("/whisper/wasm/main.js")
    log("Successfully imported main.js")

    // Debug: Check what's available in the global scope after import
    log("Checking available functions after import...")
    log("self.Module exists:", typeof self.Module)
    log(
      "Available properties on self:",
      Object.keys(self).filter(
        (key) => key.includes("whisper") || key.includes("Module") || key.includes("transcribe"),
      ),
    )

    // Check if Module has the expected functions
    if (self.Module) {
      log("Module properties:", Object.keys(self.Module))
    }
  } catch (error) {
    log("Failed to import main.js", error.message)

    // Fallback: mark as ready with mock functionality
    setTimeout(() => {
      log("Using fallback mode - WASM not available, using mock transcription")
      isReady = true
      self.postMessage({
        type: "READY",
      })
    }, 1000)
  }
}

// Initialize WASM loading
loadWASM()

// Handle messages from main thread
self.onmessage = async (e) => {
  const { type, audioBuffer } = e.data
  log(`Received message: ${type}`, {
    bufferSize: audioBuffer ? audioBuffer.byteLength : "no buffer",
  })

  if (!isReady) {
    log("Worker not ready yet")
    self.postMessage({
      type: "ERROR",
      error: "Worker not ready - still initializing",
    })
    return
  }

  if (type === "TRANSCRIBE") {
    try {
      log("Starting transcription process...")
      log("whisperModule:", typeof whisperModule)
      log("self.Module:", typeof self.Module)

      // Check what functions are available
      if (self.Module) {
        log(
          "Available Module functions:",
          Object.keys(self.Module).filter((key) => typeof self.Module[key] === "function"),
        )
      }

      // Try different possible function names
      const possibleFunctions = [
        "_transcribe",
        "transcribe",
        "_whisper_transcribe",
        "whisper_transcribe",
        "_main",
        "main",
      ]
      let transcribeFunction = null

      for (const funcName of possibleFunctions) {
        if (self.Module && typeof self.Module[funcName] === "function") {
          log(`Found transcription function: ${funcName}`)
          transcribeFunction = self.Module[funcName]
          break
        }
      }

      if (transcribeFunction) {
        log("Using real WASM transcription")

        // Convert ArrayBuffer to the format expected by WASM
        const audioData = new Uint8Array(audioBuffer)
        const result = transcribeFunction(audioData)

        log("WASM transcription completed", result)
        self.postMessage({
          type: "TRANSCRIPT",
          text: result,
        })
      } else {
        // Mock transcription for testing
        log("No transcription function found, using mock transcription")
        log("Available Module keys:", self.Module ? Object.keys(self.Module) : "Module not available")

        const mockResult = `Mock transcription at ${new Date().toLocaleTimeString()}: "This is a test transcription. Audio buffer size: ${audioBuffer.byteLength} bytes. WASM module loaded but transcription function not found."`

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 1500))

        self.postMessage({
          type: "TRANSCRIPT",
          text: mockResult,
        })
      }
    } catch (err) {
      log("Transcription error", err)
      self.postMessage({
        type: "ERROR",
        error: `Transcription failed: ${err instanceof Error ? err.message : String(err)}`,
      })
    }
  }
}

// Enhanced error handling
self.onerror = (error) => {
  log("Worker error occurred", error)
  self.postMessage({
    type: "ERROR",
    error: `Worker error: ${error.message || String(error)}`,
  })
}

// Handle unhandled promise rejections
self.addEventListener("unhandledrejection", (event) => {
  log("Unhandled promise rejection", event.reason)
  self.postMessage({
    type: "ERROR",
    error: `Unhandled promise rejection: ${String(event.reason)}`,
  })
})

log("Whisper Worker initialized and waiting for WASM module...")
