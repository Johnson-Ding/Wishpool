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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wishpool.app.designsystem.component.GoldButton
import com.wishpool.app.designsystem.component.GoldShimmerText
import com.wishpool.app.designsystem.component.RadialGlow
import com.wishpool.app.designsystem.component.StarField
import com.wishpool.app.designsystem.theme.MoonBackground
import com.wishpool.app.designsystem.theme.MoonBorder
import com.wishpool.app.designsystem.theme.MoonCard
import com.wishpool.app.designsystem.theme.MoonForeground
import com.wishpool.app.designsystem.theme.MoonGold
import com.wishpool.app.designsystem.theme.MoonGoldDim
import com.wishpool.app.designsystem.theme.MoonMutedForeground
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AiPlanRoute(
    scenarioId: Int,
    wishInput: String,
    onBack: () -> Unit,
    onConfirm: () -> Unit,
) {
    val scenario = SCENARIOS[scenarioId] ?: SCENARIOS[2]!!
    val displayWish = wishInput.ifBlank { scenario.wishText }

    // Staggered reveal for plan steps
    var revealedSteps by remember { mutableStateOf(0) }
    LaunchedEffect(Unit) {
        for (i in 1..scenario.planSteps.size) {
            delay(400L)
            revealedSteps = i
        }
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
                            "AI 为你制定方案",
                            style = MaterialTheme.typography.titleLarge,
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, "返回", tint = MoonForeground)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color.Transparent,
                    ),
                )
            },
        ) { innerPadding ->
            Column(
                modifier = Modifier
                    .padding(innerPadding)
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp),
            ) {
                // Wish card
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(MoonCard)
                        .border(1.dp, MoonGold.copy(alpha = 0.2f), RoundedCornerShape(16.dp))
                        .padding(20.dp),
                ) {
                    Column {
                        Text("🌙 你的心愿", style = MaterialTheme.typography.labelMedium, color = MoonGold)
                        Spacer(Modifier.height(8.dp))
                        Text(
                            displayWish,
                            style = MaterialTheme.typography.bodyLarge,
                            fontWeight = FontWeight.Medium,
                            color = MoonForeground,
                        )
                        Spacer(Modifier.height(8.dp))
                        Text(scenario.durationText, style = MaterialTheme.typography.bodySmall, color = MoonMutedForeground)
                    }
                }

                Spacer(Modifier.height(24.dp))

                // Plan steps
                Text("执行方案", style = MaterialTheme.typography.titleMedium, color = MoonForeground)
                Spacer(Modifier.height(16.dp))

                scenario.planSteps.forEachIndexed { index, step ->
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

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .graphicsLayer { this.alpha = alpha; translationY = offsetY }
                            .padding(bottom = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(14.dp),
                    ) {
                        // Step number circle
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(
                                    Brush.linearGradient(
                                        listOf(
                                            Color(step.typeColor),
                                            Color(step.typeColor).copy(alpha = 0.6f),
                                        ),
                                    ),
                                ),
                            contentAlignment = Alignment.Center,
                        ) {
                            Text(step.num, fontSize = 14.sp, color = MoonBackground, fontWeight = FontWeight.Bold)
                        }

                        Column(modifier = Modifier.weight(1f)) {
                            Text(step.title, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium, color = MoonForeground)
                            Spacer(Modifier.height(4.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .background(Color(step.typeColor).copy(alpha = 0.12f), RoundedCornerShape(4.dp))
                                        .padding(horizontal = 6.dp, vertical = 2.dp),
                                ) {
                                    Text(step.type, style = MaterialTheme.typography.labelSmall, color = Color(step.typeColor))
                                }
                                Text(step.desc, style = MaterialTheme.typography.labelSmall, color = MoonMutedForeground)
                            }
                        }
                    }
                }

                Spacer(Modifier.height(16.dp))

                // CTA
                GoldButton(
                    onClick = onConfirm,
                    text = "确认方案，开始执行",
                    enabled = revealedSteps >= scenario.planSteps.size,
                )

                Spacer(Modifier.height(32.dp))
            }
        }
    }
}
