package com.wishpool.app.feature.detail

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.wishpool.app.core.common.AsyncState
import com.wishpool.app.data.repository.WishesRepository
import com.wishpool.app.designsystem.component.GlassCard
import com.wishpool.app.designsystem.component.GoldButton
import com.wishpool.app.designsystem.component.CardReveal
import com.wishpool.app.designsystem.component.GoldShimmerText
import com.wishpool.app.designsystem.component.RadialGlow
import com.wishpool.app.designsystem.component.ShimmerLoading
import com.wishpool.app.designsystem.component.StarField
import com.wishpool.app.designsystem.component.WishpoolTextField
import com.wishpool.app.designsystem.theme.MoonBackground
import com.wishpool.app.designsystem.theme.MoonGold
import com.wishpool.app.designsystem.theme.MoonMutedForeground
import com.wishpool.app.designsystem.theme.MoonTeal
import com.wishpool.app.domain.wishflow.ValidationRound
import com.wishpool.app.domain.wishflow.WishTask

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WishDetailRoute(
    wishId: String,
    wishesRepository: WishesRepository,
    onBack: () -> Unit,
) {
    val viewModel = remember(wishId) { WishDetailViewModel(wishesRepository) }
    val state by viewModel.uiState.collectAsState()
    var clarifyIntent by rememberSaveable { mutableStateOf("") }
    var clarifyCity by rememberSaveable { mutableStateOf("") }
    var clarifyBudget by rememberSaveable { mutableStateOf("") }
    var clarifyTimeWindow by rememberSaveable { mutableStateOf("") }

    LaunchedEffect(wishId) {
        viewModel.load(wishId)
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MoonBackground),
    ) {
        StarField()
        RadialGlow()

        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                TopAppBar(
                    title = {
                        GoldShimmerText(
                            "愿望详情",
                            style = MaterialTheme.typography.headlineSmall,
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(Icons.AutoMirrored.Outlined.ArrowBack, "返回", tint = MoonGold)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color.Transparent,
                        scrolledContainerColor = Color.Transparent,
                    ),
                )
            },
        ) { innerPadding ->
            when (val wishState = state.wish) {
                is AsyncState.Success -> LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    item {
                        CardReveal(index = 0) {
                            WishHeader(
                                wish = wishState.data,
                                isConfirming = state.isConfirming,
                                onConfirm = { viewModel.confirm(wishId) },
                            )
                        }
                    }
                    item {
                        CardReveal(index = 1) {
                        ClarifyCard(
                            intent = clarifyIntent,
                            city = clarifyCity,
                            budget = clarifyBudget,
                            timeWindow = clarifyTimeWindow,
                            onIntentChange = { clarifyIntent = it },
                            onCityChange = { clarifyCity = it },
                            onBudgetChange = { clarifyBudget = it },
                            onTimeWindowChange = { clarifyTimeWindow = it },
                            onSubmit = {
                                viewModel.clarify(
                                    wishId = wishId,
                                    intent = clarifyIntent.ifBlank { null },
                                    city = clarifyCity.ifBlank { null },
                                    budget = clarifyBudget.ifBlank { null },
                                    timeWindow = clarifyTimeWindow.ifBlank { null },
                                )
                            },
                        )
                        }
                    }
                    item {
                        CardReveal(index = 2) {
                            Text(
                                "推进轮次",
                                style = MaterialTheme.typography.titleMedium,
                                color = MoonGold,
                                fontWeight = FontWeight.SemiBold,
                            )
                        }
                    }
                    when (val rounds = state.rounds) {
                        is AsyncState.Success -> {
                            items(rounds.data.size) { index ->
                                CardReveal(index = 3 + index) {
                                    RoundCard(rounds.data[index])
                                }
                            }
                        }
                        is AsyncState.Error -> item { Text(rounds.message, color = MaterialTheme.colorScheme.error) }
                        AsyncState.Idle, AsyncState.Loading -> item { ShimmerLoading() }
                    }
                    state.message?.let { message ->
                        item { Text(message, color = MoonGold) }
                    }
                }
                is AsyncState.Error -> CenterMessage(Modifier.padding(innerPadding), wishState.message)
                AsyncState.Idle, AsyncState.Loading -> ShimmerLoading(Modifier.padding(innerPadding))
            }
        }
    }
}

@Composable
private fun WishHeader(
    wish: WishTask,
    isConfirming: Boolean,
    onConfirm: () -> Unit,
) {
    GlassCard {
        Text(wish.title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(8.dp))
        Text(wish.intent, style = MaterialTheme.typography.bodyLarge)
        Spacer(modifier = Modifier.height(10.dp))

        // 状态胶囊
        Box(
            modifier = Modifier
                .background(MoonGold.copy(alpha = 0.12f), RoundedCornerShape(6.dp))
                .padding(horizontal = 10.dp, vertical = 4.dp),
        ) {
            Text(
                wish.status.name.replace("_", " "),
                style = MaterialTheme.typography.labelSmall,
                color = MoonGold,
            )
        }

        Spacer(modifier = Modifier.height(10.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            wish.city?.let {
                InfoTag("城市", it)
            }
            wish.budget?.let {
                InfoTag("预算", it)
            }
            wish.timeWindow?.let {
                InfoTag("时间", it)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
        GoldButton(
            onClick = onConfirm,
            enabled = !isConfirming,
            text = if (isConfirming) "确认中…" else "确认方案，开始推进",
        )
    }
}

@Composable
private fun InfoTag(label: String, value: String) {
    Column {
        Text(label, style = MaterialTheme.typography.labelSmall, color = MoonMutedForeground)
        Text(value, style = MaterialTheme.typography.bodySmall)
    }
}

@Composable
private fun ClarifyCard(
    intent: String,
    city: String,
    budget: String,
    timeWindow: String,
    onIntentChange: (String) -> Unit,
    onCityChange: (String) -> Unit,
    onBudgetChange: (String) -> Unit,
    onTimeWindowChange: (String) -> Unit,
    onSubmit: () -> Unit,
) {
    GlassCard {
        Text("补充关键信息", style = MaterialTheme.typography.titleMedium, color = MoonGold)
        Spacer(modifier = Modifier.height(12.dp))
        WishpoolTextField(value = intent, onValueChange = onIntentChange, label = "补充心愿描述")
        Spacer(modifier = Modifier.height(12.dp))
        WishpoolTextField(value = city, onValueChange = onCityChange, label = "城市")
        Spacer(modifier = Modifier.height(12.dp))
        WishpoolTextField(value = budget, onValueChange = onBudgetChange, label = "预算")
        Spacer(modifier = Modifier.height(12.dp))
        WishpoolTextField(value = timeWindow, onValueChange = onTimeWindowChange, label = "时间窗口")
        Spacer(modifier = Modifier.height(16.dp))
        GoldButton(onClick = onSubmit, text = "提交澄清")
    }
}

@Composable
private fun RoundCard(round: ValidationRound) {
    GlassCard(borderColor = MoonTeal.copy(alpha = 0.2f)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .background(MoonTeal.copy(alpha = 0.15f), RoundedCornerShape(6.dp))
                    .padding(horizontal = 10.dp, vertical = 4.dp),
            ) {
                Text("Round ${round.roundNumber}", style = MaterialTheme.typography.labelMedium, color = MoonTeal)
            }
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                when (round.humanCheckPassed) {
                    true -> "已通过"
                    false -> "未通过"
                    null -> "待确认"
                },
                style = MaterialTheme.typography.labelSmall,
                color = when (round.humanCheckPassed) {
                    true -> MoonTeal
                    false -> MaterialTheme.colorScheme.error
                    null -> MoonMutedForeground
                },
            )
        }
        Spacer(modifier = Modifier.height(10.dp))
        Text(round.summary, style = MaterialTheme.typography.bodyMedium)
    }
}

@Composable
private fun CenterMessage(modifier: Modifier = Modifier, message: String) {
    Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text(message, modifier = Modifier.padding(24.dp), style = MaterialTheme.typography.bodyMedium, color = MoonMutedForeground)
    }
}
