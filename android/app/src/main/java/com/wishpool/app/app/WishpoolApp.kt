package com.wishpool.app.app

import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.wishpool.app.feature.aiplan.AiPlanRoute
import com.wishpool.app.feature.aiplan.matchScenario
import com.wishpool.app.feature.create.WishCreateRoute
import com.wishpool.app.feature.detail.WishDetailRoute
import com.wishpool.app.feature.home.HomeRoute
import com.wishpool.app.feature.splash.SplashRoute
import java.net.URLDecoder
import java.net.URLEncoder

@Composable
fun WishpoolApp() {
    val navController = rememberNavController()
    val context = LocalContext.current.applicationContext as WishpoolApplication
    val container = context.container

    NavHost(
        navController = navController,
        startDestination = SPLASH_ROUTE,
        enterTransition = {
            slideInHorizontally(tween(350)) { it } + fadeIn(tween(300))
        },
        exitTransition = {
            slideOutHorizontally(tween(350)) { -it / 3 } + fadeOut(tween(200))
        },
        popEnterTransition = {
            slideInHorizontally(tween(350)) { -it / 3 } + fadeIn(tween(300))
        },
        popExitTransition = {
            slideOutHorizontally(tween(350)) { it } + fadeOut(tween(200))
        },
    ) {
        composable(
            route = SPLASH_ROUTE,
            enterTransition = { fadeIn(tween(400)) },
            exitTransition = { fadeOut(tween(400)) },
        ) {
            SplashRoute(
                onTimeout = {
                    navController.navigate(HOME_ROUTE) {
                        popUpTo(SPLASH_ROUTE) { inclusive = true }
                    }
                },
            )
        }
        composable(HOME_ROUTE) {
            HomeRoute(
                feedRepository = container.feedRepository,
                wishesRepository = container.wishesRepository,
                themeViewModel = container.themeViewModel,
                updateViewModel = container.updateViewModel,
                asrManager = container.asrManager,
                onCreateWish = { wishText ->
                    val (scenario, _) = matchScenario(wishText)
                    val encoded = URLEncoder.encode(wishText, "UTF-8")
                    navController.navigate("$AI_PLAN_ROUTE/${scenario.id}?wishInput=$encoded")
                },
                onOpenWish = { wishId -> navController.navigate("$DETAIL_ROUTE/$wishId") },
            )
        }
        composable(CREATE_ROUTE) {
            WishCreateRoute(
                wishesRepository = container.wishesRepository,
                onBack = { navController.popBackStack() },
                onCreated = { wishId ->
                    navController.navigate("$DETAIL_ROUTE/$wishId") {
                        popUpTo(CREATE_ROUTE) { inclusive = true }
                    }
                },
            )
        }
        composable(
            route = "$DETAIL_ROUTE/{wishId}",
            arguments = listOf(navArgument("wishId") { type = NavType.StringType }),
        ) { backStackEntry ->
            val wishId = backStackEntry.arguments?.getString("wishId").orEmpty()
            WishDetailRoute(
                wishId = wishId,
                wishesRepository = container.wishesRepository,
                onBack = { navController.popBackStack() },
            )
        }
        composable(
            route = "$AI_PLAN_ROUTE/{scenarioId}?wishInput={wishInput}",
            arguments = listOf(
                navArgument("scenarioId") { type = NavType.IntType },
                navArgument("wishInput") { type = NavType.StringType; defaultValue = "" },
            ),
        ) { backStackEntry ->
            val scenarioId = backStackEntry.arguments?.getInt("scenarioId") ?: 2
            val wishInput = URLDecoder.decode(
                backStackEntry.arguments?.getString("wishInput").orEmpty(),
                "UTF-8",
            )
            AiPlanRoute(
                scenarioId = scenarioId,
                wishInput = wishInput,
                onBack = { navController.popBackStack() },
                onConfirm = {
                    navController.navigate(HOME_ROUTE) {
                        popUpTo(HOME_ROUTE) { inclusive = true }
                    }
                },
            )
        }
    }
}

const val SPLASH_ROUTE = "splash"
const val HOME_ROUTE = "home"
const val CREATE_ROUTE = "create"
const val DETAIL_ROUTE = "detail"
const val AI_PLAN_ROUTE = "ai-plan"
