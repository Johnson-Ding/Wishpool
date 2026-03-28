package com.wishpool.app.app

import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import androidx.navigation.NavType
import com.wishpool.app.feature.create.WishCreateRoute
import com.wishpool.app.feature.detail.WishDetailRoute
import com.wishpool.app.feature.home.HomeRoute

@Composable
fun WishpoolApp() {
    val navController = rememberNavController()
    val context = LocalContext.current.applicationContext as WishpoolApplication
    val container = context.container

    NavHost(
        navController = navController,
        startDestination = HOME_ROUTE,
    ) {
        composable(HOME_ROUTE) {
            HomeRoute(
                feedRepository = container.feedRepository,
                wishesRepository = container.wishesRepository,
                onCreateWish = { navController.navigate(CREATE_ROUTE) },
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
    }
}

const val HOME_ROUTE = "home"
const val CREATE_ROUTE = "create"
const val DETAIL_ROUTE = "detail"
