package com.wishpool.app.feature.aiplan

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wishpool.app.data.repository.WishesRepository
import com.wishpool.app.designsystem.component.GoldButton
import com.wishpool.app.designsystem.component.GoldShimmerText
import com.wishpool.app.designsystem.component.WishpoolBackdrop
import com.wishpool.app.designsystem.theme.currentThemeType
import com.wishpool.app.designsystem.theme.emoji
import com.wishpool.app.designsystem.theme.wishpoolPalette
import com.wishpool.app.domain.model.AiPlanStep
import com.wishpool.app.domain.model.GeneratedPlan
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AiPlanRoute(
    scenarioId: Int,
    wishInput: String,
    wishesRepository: WishesRepository,
    onBack: () -> Unit,
    onConfirm: () -> Unit,
) {
    val palette = wishpoolPalette()
    val viewModel = remember { AiPlanViewModel(wishesRepository, wishInput) }
    val uiState by viewModel.uiState.collectAsState()

    Box(modifier = Modifier.fillMaxSize()) {
        WishpoolBackdrop()

        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                TopAppBar(
                    title = {
                        GoldShimmerText(
                            "AI 为你制定方案",
                            style = MaterialTheme.typography.titleLarge,
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, "返回", tint = palette.textPrimary)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color.Transparent,
                    ),
                )
            },
        ) { innerPadding ->
            when (val state = uiState) {
                is AiPlanUiState.Loading -> {
                    Box(
                        modifier = Modifier
                            .padding(innerPadding)
                            .fillMaxSize(),
                        contentAlignment = Alignment.Center,
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            CircularProgressIndicator(color = palette.primaryAccent)
                            Spacer(Modifier.height(16.dp))
                            Text(
                                "AI 正在分析你的心愿...",
                                style = MaterialTheme.typography.bodyMedium,
                                color = palette.textMuted,
                            )
                        }
                    }
                }

                is AiPlanUiState.Error -> {
                    Box(
                        modifier = Modifier
                            .padding(innerPadding)
                            .fillMaxSize(),
                        contentAlignment = Alignment.Center,
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                state.message,
                                style = MaterialTheme.typography.bodyMedium,
                                color = palette.textMuted,
                                textAlign = TextAlign.Center,
                            )
                            Spacer(Modifier.height(16.dp))
                            TextButton(onClick = { viewModel.retry() }) {
                                Text("重试", color = palette.primaryAccent)
                            }
                        }
                    }
                }

                is AiPlanUiState.Success -> {
                    AiPlanContent(
                        plan = state.plan,
                        wishInput = wishInput,
                        modifier = Modifier.padding(innerPadding),
                        onConfirm = onConfirm,
                    )
                }
            }
        }
    }
}

@Composable
private fun AiPlanContent(
    plan: GeneratedPlan,
    wishInput: String,
    modifier: Modifier = Modifier,
    onConfirm: () -> Unit,
) {
    val palette = wishpoolPalette()
    val displayWish = wishInput.ifBlank { plan.wishText }

    var revealedSteps by remember { mutableStateOf(0) }
    LaunchedEffect(plan) {
        revealedSteps = 0
        for (i in 1..plan.planSteps.size) {
            delay(400L)
            revealedSteps = i
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp),
    ) {
        // Wish card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(palette.cardBackgroundElevated)
                .border(1.dp, palette.primaryAccent.copy(alpha = 0.2f), RoundedCornerShape(16.dp))
                .padding(20.dp),
        ) {
            Column {
                Text("${currentThemeType().emoji()} 你的心愿", style = MaterialTheme.typography.labelMedium, color = palette.primaryAccent)
                Spacer(Modifier.height(8.dp))
                Text(
                    displayWish,
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Medium,
                    color = palette.textPrimary,
                )
                Spacer(Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(plan.durationText, style = MaterialTheme.typography.bodySmall, color = palette.textMuted)
                    Text("·", color = palette.textMuted)
                    Text(plan.category, style = MaterialTheme.typography.bodySmall, color = palette.primaryAccent)
                }
            }
        }

        Spacer(Modifier.height(24.dp))

        // Plan steps
        Text("执行方案", style = MaterialTheme.typography.titleMedium, color = palette.textPrimary)
        Spacer(Modifier.height(16.dp))

        plan.planSteps.forEachIndexed { index, step ->
            val visible = index < revealedSteps
            val alpha by animateFloatAsState(
                targetValue = if (visible) 1f else 0f,
                animationSpec = tween(400),
                label = "step_alpha_$index",
            )
            val offsetY by animateFloatAsState(
                targetValue = if (visible) 0f else 20f,
                animationSpec = tween(400),
                label = "step_offset_$index",
            )

            val stepColor = parseStepColor(step.typeColor)

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .graphicsLayer { this.alpha = alpha; translationY = offsetY }
                    .padding(bottom = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.linearGradient(
                                listOf(stepColor, stepColor.copy(alpha = 0.6f)),
                            ),
                        ),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(step.num, fontSize = 14.sp, color = palette.buttonText, fontWeight = FontWeight.Bold)
                }

                Column(modifier = Modifier.weight(1f)) {
                    Text(step.title, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium, color = palette.textPrimary)
                    Spacer(Modifier.height(4.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .background(stepColor.copy(alpha = 0.12f), RoundedCornerShape(4.dp))
                                .padding(horizontal = 6.dp, vertical = 2.dp),
                        ) {
                            Text(step.type, style = MaterialTheme.typography.labelSmall, color = stepColor)
                        }
                        Text(step.desc, style = MaterialTheme.typography.labelSmall, color = palette.textMuted)
                    }
                }
            }
        }

        Spacer(Modifier.height(16.dp))

        GoldButton(
            onClick = onConfirm,
            text = "确认方案，开始执行",
            enabled = revealedSteps >= plan.planSteps.size,
        )

        Spacer(Modifier.height(32.dp))
    }
}

/**
 * 解析步骤颜色 — 支持 AI Server 返回的 CSS 格式和静态 hex 格式
 */
private fun parseStepColor(colorStr: String): Color {
    // 处理 CSS var() 引用 — 映射到默认颜色
    if (colorStr.startsWith("var(")) {
        return when {
            colorStr.contains("accent") -> Color(0xFF4AADA0)
            colorStr.contains("primary") -> Color(0xFFF5C842)
            else -> Color(0xFF4AADA0)
        }
    }
    // 处理 #RRGGBB 格式
    if (colorStr.startsWith("#") && colorStr.length == 7) {
        return try {
            Color(android.graphics.Color.parseColor(colorStr))
        } catch (_: Exception) {
            Color(0xFF4AADA0)
        }
    }
    // 处理 0xAARRGGBB Long 格式（ScenarioData 中的静态数据）
    return try {
        Color(colorStr.removePrefix("0x").toLong(16))
    } catch (_: Exception) {
        Color(0xFF4AADA0)
    }
}
