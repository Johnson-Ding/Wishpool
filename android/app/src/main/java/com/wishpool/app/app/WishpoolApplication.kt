package com.wishpool.app.app

import android.app.Application
import android.util.Log

class WishpoolApplication : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = DefaultAppContainer(this)

        // Anonymous auth must happen before any API calls
        Thread {
            try {
                container.authManager.signInAnonymously()
                Log.d("WishpoolApp", "Anonymous auth completed")
            } catch (e: Exception) {
                Log.e("WishpoolApp", "Anonymous auth failed: ${e.message}", e)
            }
        }.start()

        container.asrManager.warmUp()
    }
}
