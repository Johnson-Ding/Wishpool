package com.wishpool.app.core.network

import android.util.Log
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

class HttpException(
    val statusCode: Int,
    override val message: String,
) : Exception(message)

class HttpClient(
    private val defaultHeaders: Map<String, String> = emptyMap(),
    private val enableVerboseLogs: Boolean = false,
) {
    fun get(url: String): String = request("GET", url)

    fun post(url: String, body: String? = null): String = request("POST", url, body)

    fun patch(url: String, body: String): String = request("PATCH", url, body)

    private fun request(method: String, url: String, body: String? = null): String {
        val connection = (URL(url).openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 8_000
            readTimeout = 8_000
            setRequestProperty("Content-Type", "application/json")
            defaultHeaders.forEach { (key, value) -> setRequestProperty(key, value) }
            doInput = true
        }

        if (body != null) {
            connection.doOutput = true
            connection.outputStream.use { stream ->
                stream.write(body.toByteArray())
            }
        }

        return try {
            val code = connection.responseCode
            val source = if (code in 200..299) {
                connection.inputStream
            } else {
                connection.errorStream
            }

            val payload = source?.use { stream ->
                BufferedReader(InputStreamReader(stream)).readText()
            }.orEmpty()

            if (enableVerboseLogs) {
                Log.d("WishpoolHttp", "$method $url -> $code")
            }

            if (code !in 200..299) {
                throw HttpException(code, payload.ifBlank { "HTTP $code" })
            }

            payload
        } finally {
            connection.disconnect()
        }
    }
}

