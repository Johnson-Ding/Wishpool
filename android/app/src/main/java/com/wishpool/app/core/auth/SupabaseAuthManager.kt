package com.wishpool.app.core.auth

import android.util.Log
import com.wishpool.app.core.network.HttpClient
import org.json.JSONObject

/**
 * Manages Supabase anonymous authentication via REST API.
 * Uses the same custom HttpClient as the rest of the app (HttpURLConnection-based).
 */
class SupabaseAuthManager(
    private val supabaseUrl: String,
    private val supabaseAnonKey: String,
) {
    private var accessToken: String? = null
    private var refreshToken: String? = null

    val isAuthenticated: Boolean get() = accessToken != null

    fun getAccessToken(): String? = accessToken

    private val authClient = HttpClient(
        defaultHeaders = mapOf(
            "apikey" to supabaseAnonKey,
            "Content-Type" to "application/json",
        )
    )

    /**
     * Sign in anonymously via Supabase Auth REST API.
     * POST /auth/v1/signup with empty body creates an anonymous user.
     */
    fun signInAnonymously() {
        if (accessToken != null) return

        try {
            val response = authClient.post(
                "$supabaseUrl/auth/v1/signup",
                JSONObject().toString() // empty JSON body for anonymous signup
            )

            val json = JSONObject(response)
            accessToken = json.getString("access_token")
            refreshToken = json.optString("refresh_token", null)
            Log.d(TAG, "Anonymous sign-in successful")
        } catch (e: Exception) {
            Log.e(TAG, "Anonymous sign-in failed: ${e.message}", e)
            throw e
        }
    }

    /**
     * Refresh the access token using the refresh token.
     */
    fun refreshSession() {
        val rt = refreshToken ?: throw IllegalStateException("No refresh token available")

        try {
            val body = JSONObject().put("refresh_token", rt)
            val response = authClient.post(
                "$supabaseUrl/auth/v1/token?grant_type=refresh_token",
                body.toString()
            )

            val json = JSONObject(response)
            accessToken = json.getString("access_token")
            refreshToken = json.optString("refresh_token", rt)
            Log.d(TAG, "Session refreshed successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Session refresh failed: ${e.message}", e)
            throw e
        }
    }

    companion object {
        private const val TAG = "SupabaseAuthManager"
    }
}
