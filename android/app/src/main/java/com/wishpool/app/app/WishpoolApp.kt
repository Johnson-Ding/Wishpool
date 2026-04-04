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
import com.wishpool.app.feature.paywall.PaywallRoute
import com.wishpool.app.feature.wishflow.WishPlanningRoute
import com.wishpool.app.feature.wishflow.RoundUpdateRoute
import com.wishpool.app.feature.wishflow.PartnerMatchRoute
import com.wishpool.app.feature.wishflow.CollabPrepRoute
import com.wishpool.app.feature.wishflow.FulfillmentRoute
import com.wishpool.app.feature.wishflow.FeedbackRoute
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
                wishesRepository = container.wishesRepository,
                onBack = { navController.popBackStack() },
                onConfirm = {
                    navController.navigate(HOME_ROUTE) {
                        popUpTo(HOME_ROUTE) { inclusive = true }
                    }
                },
            )
        }
        composable(PAYWALL_ROUTE) {
            PaywallRoute(
                onBack = { navController.popBackStack() },
                onJoin = { navController.popBackStack() },
            )
        }
        composable(WISH_PLANNING_ROUTE) {
            WishPlanningRoute(
                wishDraft = "",
                onBack = { navController.popBackStack() },
                onConfirm = { navController.navigate(ROUND_UPDATE_ROUTE) },
            )
        }
        composable(ROUND_UPDATE_ROUTE) {
            RoundUpdateRoute(
                progress = com.wishpool.app.feature.wishflow.RoundProgress(
                    "第 1 轮", "预计 3 天",
                    listOf("已完成初步调研", "正在联系场地"),
                    listOf("确认最终人数", "预订场地")
                ),
                onBack = { navController.popBackStack() },
                onContinue = { navController.navigate(PARTNER_MATCH_ROUTE) },
            )
        }
        composable(PARTNER_MATCH_ROUTE) {
            PartnerMatchRoute(
                candidate = com.wishpool.app.feature.wishflow.PartnerCandidate(
                    "🎿", "滑雪爱好者", "去过崇礼 5 次", "匹配度 85%",
                    listOf("经验" to "5次", "技能" to "中级")
                ),
                onBack = { navController.popBackStack() },
                onInvite = { navController.navigate(COLLAB_PREP_ROUTE) },
                onSkip = { navController.navigate(COLLAB_PREP_ROUTE) },
            )
        }
        composable(COLLAB_PREP_ROUTE) {
            CollabPrepRoute(
                details = com.wishpool.app.feature.wishflow.CollabDetails(
                    "崇礼滑雪之旅",
                    listOf("2026-04-10 09:00", "2026-04-11 09:00"),
                    listOf("崇礼万龙滑雪场", "崇礼太舞滑雪场"),
                    listOf(Triple("雪票", "¥400", "张三"), Triple("交通", "¥200", "李四")),
                    "¥800/人"
                ),
                onBack = { navController.popBackStack() },
                onConfirm = { navController.navigate(FULFILLMENT_ROUTE) },
            )
        }
        composable(FULFILLMENT_ROUTE) {
            FulfillmentRoute(
                itinerary = listOf(
                    com.wishpool.app.feature.wishflow.ItineraryItem("09:00", "集合出发", true),
                    com.wishpool.app.feature.wishflow.ItineraryItem("11:00", "到达雪场", true),
                    com.wishpool.app.feature.wishflow.ItineraryItem("14:00", "午餐休息", false)
                ),
                onBack = { navController.popBackStack() },
                onComplete = { navController.navigate(FEEDBACK_ROUTE) },
            )
        }
        composable(FEEDBACK_ROUTE) {
            FeedbackRoute(
                wishTitle = "崇礼滑雪之旅",
                onBack = { navController.popBackStack() },
                onSubmit = { _, _ ->
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
const val PAYWALL_ROUTE = "paywall"
const val WISH_PLANNING_ROUTE = "wish-planning"
const val ROUND_UPDATE_ROUTE = "round-update"
const val PARTNER_MATCH_ROUTE = "partner-match"
const val COLLAB_PREP_ROUTE = "collab-prep"
const val FULFILLMENT_ROUTE = "fulfillment"
const val FEEDBACK_ROUTE = "feedback"
