package com.wishpool.app.feature.create

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.wishpool.app.data.repository.WishesRepository
import com.wishpool.app.designsystem.component.CardReveal
import com.wishpool.app.designsystem.component.GlassCard
import com.wishpool.app.designsystem.component.GoldButton
import com.wishpool.app.designsystem.component.GoldShimmerText
import com.wishpool.app.designsystem.component.WishpoolBackdrop
import com.wishpool.app.designsystem.component.WishpoolTextField
import com.wishpool.app.designsystem.theme.wishpoolPalette

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WishCreateRoute(
    wishesRepository: WishesRepository,
    onBack: () -> Unit,
    onCreated: (String) -> Unit,
) {
    val palette = wishpoolPalette()
    val viewModel = remember { WishCreateViewModel(wishesRepository) }
    val state by viewModel.uiState.collectAsState()

    LaunchedEffect(state.createdWish?.id) {
        state.createdWish?.id?.let { onCreated(it) }
    }

    Box(
        modifier = Modifier.fillMaxSize(),
    ) {
        WishpoolBackdrop()

        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                TopAppBar(
                    title = {
                        GoldShimmerText(
                            "说出你的心愿",
                            style = MaterialTheme.typography.headlineSmall,
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(Icons.AutoMirrored.Outlined.ArrowBack, "返回", tint = palette.primaryAccent)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color.Transparent,
                        scrolledContainerColor = Color.Transparent,
                    ),
                )
            },
        ) { innerPadding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                CardReveal(index = 0) {
                    Text(
                        "先把愿望说清楚，后续再进入方案和推进。",
                        style = MaterialTheme.typography.bodyMedium,
                        color = palette.textMuted,
                    )
                }

                CardReveal(index = 1) {
                GlassCard {
                    WishpoolTextField(
                        value = state.form.intent,
                        onValueChange = viewModel::updateIntent,
                        label = "你现在最想实现什么？",
                        minLines = 3,
                    )
                    Spacer(modifier = Modifier.height(14.dp))
                    WishpoolTextField(
                        value = state.form.city,
                        onValueChange = viewModel::updateCity,
                        label = "城市（可选）",
                    )
                    Spacer(modifier = Modifier.height(14.dp))
                    WishpoolTextField(
                        value = state.form.budget,
                        onValueChange = viewModel::updateBudget,
                        label = "预算（可选）",
                    )
                    Spacer(modifier = Modifier.height(14.dp))
                    WishpoolTextField(
                        value = state.form.timeWindow,
                        onValueChange = viewModel::updateTimeWindow,
                        label = "时间窗口（可选）",
                    )
                }
                }

                state.errorMessage?.let {
                    Text(it, color = MaterialTheme.colorScheme.error)
                }

                CardReveal(index = 2) {
                    GoldButton(
                        onClick = viewModel::submit,
                        enabled = !state.isSubmitting,
                        text = if (state.isSubmitting) "提交中…" else "生成初版愿望",
                    )
                }
            }
        }
    }
}
