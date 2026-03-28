package com.wishpool.app.core.asr

import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancelAndJoin
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

interface AudioPcmSource {
    suspend fun start(onSamples: (FloatArray) -> Unit)

    suspend fun stop()
}

class AudioRecordManager(
    private val dispatcher: CoroutineDispatcher = Dispatchers.IO,
) : AudioPcmSource {
    private val scope = CoroutineScope(SupervisorJob() + dispatcher)
    private var audioRecord: AudioRecord? = null
    private var readJob: Job? = null

    override suspend fun start(onSamples: (FloatArray) -> Unit) {
        stop()
        withContext(dispatcher) {
            val minBufferSize = AudioRecord.getMinBufferSize(
                SAMPLE_RATE,
                AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.ENCODING_PCM_16BIT,
            )
            require(minBufferSize > 0) { "Unable to determine AudioRecord buffer size" }

            val record = AudioRecord(
                MediaRecorder.AudioSource.MIC,
                SAMPLE_RATE,
                AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.ENCODING_PCM_16BIT,
                minBufferSize * 2,
            )
            require(record.state == AudioRecord.STATE_INITIALIZED) { "AudioRecord 初始化失败" }

            audioRecord = record
            record.startRecording()
            readJob = scope.launch {
                val buffer = ShortArray(minBufferSize / 2)
                while (isActive) {
                    val read = record.read(buffer, 0, buffer.size)
                    if (read > 0) {
                        val samples = FloatArray(read) { index ->
                            buffer[index] / 32768f
                        }
                        onSamples(samples)
                    }
                }
            }
        }
    }

    override suspend fun stop() {
        readJob?.cancelAndJoin()
        readJob = null
        withContext(dispatcher) {
            audioRecord?.let { record ->
                runCatching {
                    if (record.recordingState == AudioRecord.RECORDSTATE_RECORDING) {
                        record.stop()
                    }
                }
                record.release()
            }
            audioRecord = null
        }
    }

    companion object {
        const val SAMPLE_RATE = 16000
    }
}
