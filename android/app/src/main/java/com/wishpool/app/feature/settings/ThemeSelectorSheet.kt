package com.wishpool.app.feature.settings

import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wishpool.app.designsystem.theme.*

/**
 * 主题选择器浮层
 * 展示可用主题选项，支持实时预览切换效果
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ThemeSelectorSheet(
    currentTheme: WishpoolThemeType,
    onThemeSelected: (WishpoolThemeType) -> Unit,
    onDismiss: () -> Unit,
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = MaterialTheme.colorScheme.surface,
        contentColor = MaterialTheme.colorScheme.onSurface,
        dragHandle = {
            Box(
                modifier = Modifier
                    .padding(vertical = 16.dp)
                    .size(width = 40.dp, height = 4.dp)
                    .background(
                        MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f),
                        RoundedCornerShape(2.dp)
                    )
            )
        }
    ) {
        ThemeSelectorContent(
            currentTheme = currentTheme,
            onThemeSelected = onThemeSelected,
        )
    }
}

@Composable
private fun ThemeSelectorContent(
    currentTheme: WishpoolThemeType,
    onThemeSelected: (WishpoolThemeType) -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp)
            .padding(bottom = 32.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // 标题
        Text(
            text = "选择你的专属主题",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.SemiBold,
        )

        Text(
            text = "每个角色都有独特的视觉氛围，选择最适合你此刻心境的主题吧",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        // 主题选项
        WishpoolThemeType.entries.forEach { themeType ->
            ThemeOption(
                themeType = themeType,
                isSelected = themeType == currentTheme,
                onClick = { onThemeSelected(themeType) }
            )
        }
    }
}

@Composable
private fun ThemeOption(
    themeType: WishpoolThemeType,
    isSelected: Boolean,
    onClick: () -> Unit,
) {
    val scale by animateFloatAsState(
        targetValue = if (isSelected) 1.02f else 1f,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        ),
        label = "theme_option_scale"
    )

    val (backgroundColor, borderColor, primaryColor, description) = when (themeType) {
        WishpoolThemeType.MOON -> ThemePreview(
            background = MoonCard,
            border = MoonGold.copy(alpha = 0.3f),
            primary = MoonGold,
            description = "深夜水墨的月光容器，沉静而温暖"
        )
        WishpoolThemeType.CLOUD -> ThemePreview(
            background = CloudCard,
            border = CloudPrimary.copy(alpha = 0.3f),
            primary = CloudPrimary,
            description = "晨曦白昼的植绒呼吸，轻盈而治愈"
        )
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .scale(scale)
            .clip(RoundedCornerShape(16.dp))
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(
            containerColor = backgroundColor
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = if (isSelected) 8.dp else 2.dp
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp)
                .then(
                    if (isSelected) {
                        Modifier.border(
                            width = 2.dp,
                            brush = Brush.linearGradient(
                                listOf(primaryColor, primaryColor.copy(alpha = 0.6f))
                            ),
                            shape = RoundedCornerShape(16.dp)
                        )
                    } else Modifier
                ),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // 主题角色 emoji
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(
                        brush = Brush.radialGradient(
                            colors = listOf(
                                primaryColor.copy(alpha = 0.15f),
                                primaryColor.copy(alpha = 0.05f)
                            )
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = themeType.emoji(),
                    fontSize = 24.sp
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = themeType.displayName(),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = primaryColor
                )
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            // 选中状态指示器
            if (isSelected) {
                Box(
                    modifier = Modifier
                        .size(20.dp)
                        .background(primaryColor, RoundedCornerShape(10.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "✓",
                        color = Color.White,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

private data class ThemePreview(
    val background: Color,
    val border: Color,
    val primary: Color,
    val description: String,
)