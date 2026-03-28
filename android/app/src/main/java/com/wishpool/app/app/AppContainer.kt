package com.wishpool.app.app

import android.content.Context
import com.wishpool.app.BuildConfig
import com.wishpool.app.core.common.DeviceIdProvider
import com.wishpool.app.core.config.AppConfig
import com.wishpool.app.core.config.AppConfigs
import com.wishpool.app.data.remote.WishpoolApi
import com.wishpool.app.data.repository.FeedRepository
import com.wishpool.app.data.repository.NetworkFeedRepository
import com.wishpool.app.data.repository.NetworkWishesRepository
import com.wishpool.app.data.repository.WishesRepository

interface AppContainer {
    val config: AppConfig
    val deviceIdProvider: DeviceIdProvider
    val api: WishpoolApi
    val feedRepository: FeedRepository
    val wishesRepository: WishesRepository
}

class DefaultAppContainer(context: Context) : AppContainer {
    override val config: AppConfig = if (BuildConfig.DEBUG) {
        AppConfigs.debug
    } else {
        AppConfigs.release
    }

    override val deviceIdProvider: DeviceIdProvider = DeviceIdProvider(context)

    override val api: WishpoolApi = WishpoolApi(
        baseUrl = config.apiBaseUrl,
        enableVerboseLogs = config.enableVerboseLogs,
    )

    override val feedRepository: FeedRepository = NetworkFeedRepository(
        api = api,
        deviceIdProvider = deviceIdProvider,
    )

    override val wishesRepository: WishesRepository = NetworkWishesRepository(
        api = api,
        deviceIdProvider = deviceIdProvider,
    )
}

