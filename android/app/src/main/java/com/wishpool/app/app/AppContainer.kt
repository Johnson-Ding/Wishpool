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
import com.wishpool.app.core.theme.ThemePreference
import com.wishpool.app.core.theme.ThemeViewModel
import com.wishpool.app.core.update.UpdateManager
import com.wishpool.app.feature.settings.UpdateViewModel

interface AppContainer {
    val config: AppConfig
    val deviceIdProvider: DeviceIdProvider
    val api: WishpoolApi
    val feedRepository: FeedRepository
    val wishesRepository: WishesRepository
    val themePreference: ThemePreference
    val themeViewModel: ThemeViewModel
    val updateManager: UpdateManager
    val updateViewModel: UpdateViewModel
}

class DefaultAppContainer(context: Context) : AppContainer {
    override val config: AppConfig = if (BuildConfig.DEBUG) {
        AppConfigs.debug
    } else {
        AppConfigs.release
    }

    override val deviceIdProvider: DeviceIdProvider = DeviceIdProvider(context)

    override val api: WishpoolApi = WishpoolApi(
        supabaseUrl = config.supabaseUrl,
        supabaseAnonKey = config.supabaseAnonKey,
        enableVerboseLogs = config.enableVerboseLogs,
    )

    override val feedRepository: FeedRepository = NetworkFeedRepository(
        api = api,
    )

    override val wishesRepository: WishesRepository = NetworkWishesRepository(
        api = api,
        deviceIdProvider = deviceIdProvider,
    )

    override val themePreference: ThemePreference = ThemePreference(context)

    override val themeViewModel: ThemeViewModel = ThemeViewModel(themePreference)

    override val updateManager: UpdateManager = UpdateManager(context)

    override val updateViewModel: UpdateViewModel = UpdateViewModel(updateManager)
}

