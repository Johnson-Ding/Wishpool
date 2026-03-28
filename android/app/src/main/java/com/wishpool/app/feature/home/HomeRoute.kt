package com.wishpool.app.feature.home

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Comment
import androidx.compose.material.icons.automirrored.outlined.List
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
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
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wishpool.app.core.common.AsyncState
import com.wishpool.app.data.repository.FeedRepository
import com.wishpool.app.data.repository.WishesRepository
import com.wishpool.app.designsystem.component.CardReveal
import com.wishpool.app.designsystem.component.GlassCard
import com.wishpool.app.designsystem.component.GoldShimmerText
import com.wishpool.app.designsystem.component.RadialGlow
import com.wishpool.app.designsystem.component.ShimmerLoading
import com.wishpool.app.designsystem.component.StarField
import com.wishpool.app.designsystem.component.SwipeableCardStack
import com.wishpool.app.designsystem.theme.MoonBackground
import com.wishpool.app.designsystem.theme.MoonBorder
import com.wishpool.app.designsystem.theme.MoonCard
import com.wishpool.app.designsystem.theme.MoonForeground
import com.wishpool.app.designsystem.theme.MoonGold
import com.wishpool.app.designsystem.theme.MoonGoldDim
import com.wishpool.app.designsystem.theme.MoonMutedForeground
import com.wishpool.app.designsystem.theme.MoonTeal
import com.wishpool.app.designsystem.theme.tagColor
import com.wishpool.app.designsystem.theme.typeLabel
import com.wishpool.app.domain.wishflow.FeedComment
import com.wishpool.app.domain.wishflow.FeedItem
import com.wishpool.app.domain.wishflow.WishTask
import com.wishpool.app.feature.feed.FeedViewModel
import com.wishpool.app.feature.mywishes.MyWishesViewModel
import com.wishpool.app.feature.mywishes.WishSection

private enum class HomeTab { FEED, MY_WISHES }

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeRoute(
    feedRepository: FeedRepository,
    wishesRepository: WishesRepository,
    onCreateWish: (String) -> Unit,
    onOpenWish: (String) -> Unit,
) {
    val feedViewModel = remember { FeedViewModel(feedRepository) }
    val wishesViewModel = remember { MyWishesViewModel(wishesRepository) }
    val feedState by feedViewModel.uiState.collectAsState()
    val myWishesState by wishesViewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    var activeTab by rememberSaveable { mutableStateOf(HomeTab.FEED) }
    var pendingCommentBottleId by rememberSaveable { mutableStateOf<Int?>(null) }
    var commentDraft by rememberSaveable { mutableStateOf("") }
    var showPublisher by rememberSaveable { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        feedViewModel.loadFeed()
        wishesViewModel.load()
    }

    LaunchedEffect(feedState.actionMessage) {
        feedState.actionMessage?.let {
            snackbarHostState.showSnackbar(it)
            feedViewModel.consumeMessage()
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
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(
                                        Brush.radialGradient(
                                            colors = listOf(
                                                MoonGold.copy(alpha = 0.15f),
                                                MoonGoldDim.copy(alpha = 0.08f),
                                            ),
                                        ),
                                    )
                                    .border(
                                        width = 1.dp,
                                        brush = Brush.linearGradient(
                                            listOf(MoonGold.copy(alpha = 0.6f), MoonGoldDim.copy(alpha = 0.3f)),
                                        ),
                                        shape = CircleShape,
                                    ),
                                contentAlignment = Alignment.Center,
                            ) {
                                Text("🌙", fontSize = 16.sp)
                            }
                            GoldShimmerText(
                                "许愿池",
                                style = MaterialTheme.typography.headlineMedium,
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color.Transparent,
                        scrolledContainerColor = Color.Transparent,
                    ),
                )
            },
            bottomBar = {
                MoonBottomBar(
                    activeTab = activeTab,
                    onTabChange = { activeTab = it },
                    onCreateWish = { showPublisher = true },
                )
            },
            snackbarHost = { SnackbarHost(snackbarHostState) },
        ) { innerPadding ->
            when (activeTab) {
                HomeTab.FEED -> FeedTab(
                    modifier = Modifier.padding(innerPadding),
                    state = feedState,
                    onLike = feedViewModel::like,
                    onComment = { bottleId ->
                        pendingCommentBottleId = bottleId
                        commentDraft = ""
                        feedViewModel.openComments(bottleId)
                    },
                )
                HomeTab.MY_WISHES -> MyWishesTab(
                    modifier = Modifier.padding(innerPadding),
                    state = myWishesState.sections,
                    onOpenWish = onOpenWish,
                    onRefresh = wishesViewModel::load,
                )
            }
        }
    }

    if (showPublisher) {
        PublisherSheet(
            onDismiss = { showPublisher = false },
            onSubmit = { wishText ->
                showPublisher = false
                onCreateWish(wishText)
            },
        )
    }

    if (pendingCommentBottleId != null) {
        CommentDialog(
            comments = feedState.selectedComments,
            draft = commentDraft,
            onDraftChange = { commentDraft = it },
            onDismiss = {
                pendingCommentBottleId = null
                commentDraft = ""
                feedViewModel.closeComments()
            },
            onSubmit = {
                pendingCommentBottleId?.let { bottleId ->
                    feedViewModel.comment(bottleId, commentDraft)
                    commentDraft = ""
                }
            },
        )
    }
}

// ── 底部导航 ────────────────────────────────────────────────

@Composable
private fun MoonBottomBar(
    activeTab: HomeTab,
    onTabChange: (HomeTab) -> Unit,
    onCreateWish: () -> Unit,
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(MoonCard.copy(alpha = 0.92f))
            .navigationBarsPadding()
            .padding(top = 8.dp, bottom = 10.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            NavItem(
                icon = Icons.Outlined.Explore,
                label = "广场",
                active = activeTab == HomeTab.FEED,
                onClick = { onTabChange(HomeTab.FEED) },
            )

            // 中央金色 FAB
            Box(
                modifier = Modifier
                    .size(52.dp)
                    .clip(CircleShape)
                    .background(Brush.linearGradient(listOf(MoonGold, MoonGoldDim)))
                    .clickable(onClick = onCreateWish),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    Icons.Outlined.Add,
                    contentDescription = "发愿",
                    tint = MoonBackground,
                    modifier = Modifier.size(26.dp),
                )
            }

            NavItem(
                icon = Icons.AutoMirrored.Outlined.List,
                label = "我的愿望",
                active = activeTab == HomeTab.MY_WISHES,
                onClick = { onTabChange(HomeTab.MY_WISHES) },
            )
        }
    }
}

@Composable
private fun NavItem(
    icon: ImageVector,
    label: String,
    active: Boolean,
    onClick: () -> Unit,
) {
    val color = if (active) MoonGold else MoonMutedForeground
    Column(
        modifier = Modifier
            .clickable(onClick = onClick)
            .padding(horizontal = 20.dp, vertical = 4.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icon(icon, contentDescription = label, tint = color, modifier = Modifier.size(22.dp))
        Spacer(modifier = Modifier.height(2.dp))
        Text(label, style = MaterialTheme.typography.labelSmall, color = color)
    }
}

// ── Feed Tab ────────────────────────────────────────────────

@Composable
private fun FeedTab(
    modifier: Modifier = Modifier,
    state: com.wishpool.app.feature.feed.FeedUiState,
    onLike: (Int) -> Unit,
    onComment: (Int) -> Unit,
) {
    when (val feed = state.feed) {
        is AsyncState.Success -> SwipeableCardStack(
            items = feed.data,
            modifier = modifier.fillMaxSize(),
        ) { item ->
            FeedCard(item = item, onLike = { onLike(item.id) }, onComment = { onComment(item.id) })
        }
        is AsyncState.Error -> CenterMessage(modifier, feed.message)
        AsyncState.Idle, AsyncState.Loading -> ShimmerLoading(modifier)
    }
}

@Composable
private fun FeedCard(
    item: FeedItem,
    onLike: () -> Unit,
    onComment: () -> Unit,
) {
    val tColor = tagColor(item.tag)
    val isPoemOrQuote = item.type == "poem" || item.type == "quote"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .clip(RoundedCornerShape(24.dp))
            .background(MoonCard)
            .border(1.dp, tColor.copy(alpha = 0.16f), RoundedCornerShape(24.dp)),
    ) {
        if (isPoemOrQuote) {
            // Full-card centered text (poem / quote)
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .background(
                        Brush.linearGradient(
                            colors = listOf(tColor.copy(alpha = 0.14f), MoonCard),
                            start = Offset(0f, 0f),
                            end = Offset(800f, 800f),
                        ),
                    ),
                contentAlignment = Alignment.Center,
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(28.dp),
                ) {
                    TagBadge(tag = item.tag, color = tColor)
                    Spacer(Modifier.height(28.dp))
                    Text(
                        item.excerpt,
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.Bold,
                            lineHeight = 36.sp,
                        ),
                        textAlign = TextAlign.Center,
                        color = MoonForeground,
                    )
                }
            }
        } else {
            // Header with tag-colored gradient + StarField
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(176.dp)
                    .background(tColor.copy(alpha = 0.12f)),
            ) {
                StarField()
                Row(
                    modifier = Modifier
                        .padding(16.dp)
                        .align(Alignment.TopStart),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    TagBadge(tag = item.tag, color = tColor)
                    val tl = typeLabel(item.type)
                    if (tl.isNotEmpty()) {
                        Box(
                            modifier = Modifier
                                .background(MoonBackground.copy(alpha = 0.5f), RoundedCornerShape(20.dp))
                                .padding(horizontal = 8.dp, vertical = 4.dp),
                        ) {
                            Text(tl, style = MaterialTheme.typography.labelSmall, color = MoonMutedForeground)
                        }
                    }
                }
            }

            // Content area
            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(20.dp),
            ) {
                Text(
                    item.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MoonForeground,
                )
                Spacer(Modifier.height(6.dp))
                Text(
                    item.excerpt,
                    style = MaterialTheme.typography.bodySmall,
                    color = MoonMutedForeground,
                    maxLines = 4,
                )

                Spacer(Modifier.weight(1f))

                // Meta + location
                if (item.meta.isNotBlank() || item.loc.isNotBlank()) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        if (item.meta.isNotBlank()) {
                            Box(
                                modifier = Modifier
                                    .background(MoonTeal.copy(alpha = 0.10f), RoundedCornerShape(20.dp))
                                    .padding(horizontal = 10.dp, vertical = 4.dp),
                            ) {
                                Text(item.meta, style = MaterialTheme.typography.labelSmall, color = MoonTeal)
                            }
                        }
                        if (item.loc.isNotBlank()) {
                            Text(item.loc, style = MaterialTheme.typography.labelSmall, color = MoonMutedForeground)
                        }
                    }
                    Spacer(Modifier.height(12.dp))
                }
            }
        }

        // Bottom action bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            ActionChip(
                icon = { Icon(Icons.Outlined.FavoriteBorder, null, Modifier.size(16.dp)) },
                text = item.likes.toString(),
                onClick = onLike,
            )
            ActionChip(
                icon = { Icon(Icons.AutoMirrored.Outlined.Comment, null, Modifier.size(16.dp)) },
                text = "评论",
                onClick = onComment,
            )
            ActionChip(
                icon = { Icon(Icons.Outlined.Add, null, Modifier.size(16.dp)) },
                text = "我也想做",
                onClick = {},
            )
        }
    }
}

@Composable
private fun ActionChip(
    icon: @Composable () -> Unit,
    text: String,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(Color.White.copy(alpha = 0.06f))
            .border(1.dp, MoonBorder, RoundedCornerShape(8.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 7.dp),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        icon()
        Text(text, style = MaterialTheme.typography.labelMedium)
    }
}

// ── 我的愿望 Tab ────────────────────────────────────────────

@Composable
private fun MyWishesTab(
    modifier: Modifier = Modifier,
    state: AsyncState<List<WishSection>>,
    onOpenWish: (String) -> Unit,
    onRefresh: () -> Unit,
) {
    when (state) {
        is AsyncState.Success -> LazyColumn(
            modifier = modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp),
        ) {
            items(state.data.size) { sectionIndex ->
                val section = state.data[sectionIndex]
                CardReveal(index = sectionIndex) {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(section.title, style = MaterialTheme.typography.titleMedium, color = MoonGold)
                        if (section.title == "待决策") {
                            Box(
                                modifier = Modifier
                                    .background(Color(0xFFCF6679), RoundedCornerShape(6.dp))
                                    .padding(horizontal = 8.dp, vertical = 2.dp),
                            ) {
                                Text(section.items.size.toString(), color = Color.White, style = MaterialTheme.typography.labelSmall)
                            }
                        }
                    }
                    section.items.forEach { wish ->
                        WishSummaryCard(wish = wish, onClick = { onOpenWish(wish.id) })
                    }
                }
                }
            }
        }
        is AsyncState.Error -> CenterMessage(modifier, "${state.message}\n下拉刷新暂未接入，你可以返回重试。")
        AsyncState.Idle, AsyncState.Loading -> ShimmerLoading(modifier)
    }
}

@Composable
private fun WishSummaryCard(
    wish: WishTask,
    onClick: () -> Unit,
) {
    GlassCard(
        modifier = Modifier.clickable(onClick = onClick),
    ) {
        Text(wish.title, style = MaterialTheme.typography.titleMedium)
        Spacer(modifier = Modifier.height(6.dp))
        Text(wish.intent, style = MaterialTheme.typography.bodyMedium, color = MoonMutedForeground)
        Spacer(modifier = Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            StatusPill(label = wish.status.name.replace("_", " "))
            wish.city?.let {
                Text(it, style = MaterialTheme.typography.bodySmall, color = MoonMutedForeground)
            }
            Spacer(modifier = Modifier.weight(1f))
            Icon(Icons.Outlined.Schedule, null, Modifier.size(14.dp), tint = MoonMutedForeground)
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = wish.updatedAt.takeIf { it.isNotBlank() }?.substringBefore("T") ?: "待更新",
                style = MaterialTheme.typography.bodySmall,
                color = MoonMutedForeground,
            )
        }
    }
}

@Composable
private fun StatusPill(label: String) {
    Box(
        modifier = Modifier
            .background(MoonGold.copy(alpha = 0.12f), RoundedCornerShape(6.dp))
            .padding(horizontal = 10.dp, vertical = 4.dp),
    ) {
        Text(label, style = MaterialTheme.typography.labelSmall, color = MoonGold)
    }
}

// ── 评论弹窗 ────────────────────────────────────────────────

@Composable
private fun CommentDialog(
    comments: AsyncState<List<FeedComment>>,
    draft: String,
    onDraftChange: (String) -> Unit,
    onDismiss: () -> Unit,
    onSubmit: () -> Unit,
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = MoonCard,
        title = { Text("评论", color = MoonGold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                when (comments) {
                    is AsyncState.Success -> {
                        if (comments.data.isEmpty()) {
                            Text("还没有评论，做第一个回应的人。", color = MoonMutedForeground)
                        } else {
                            comments.data.takeLast(3).forEach { comment ->
                                Text("· ${comment.authorName}：${comment.content}")
                            }
                        }
                    }
                    is AsyncState.Error -> Text(comments.message, color = MaterialTheme.colorScheme.error)
                    AsyncState.Idle, AsyncState.Loading -> Text("正在加载评论…", color = MoonMutedForeground)
                }
                OutlinedTextField(
                    value = draft,
                    onValueChange = onDraftChange,
                    label = { Text("写点回应") },
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        },
        confirmButton = {
            Button(onClick = onSubmit, enabled = draft.isNotBlank()) {
                Text("发送")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("关闭") }
        },
    )
}

// ── Tag Badge ────────────────────────────────────────────────

@Composable
private fun TagBadge(tag: String, color: Color) {
    Box(
        modifier = Modifier
            .background(color.copy(alpha = 0.15f), RoundedCornerShape(20.dp))
            .border(1.dp, color.copy(alpha = 0.25f), RoundedCornerShape(20.dp))
            .padding(horizontal = 12.dp, vertical = 5.dp),
    ) {
        Text(tag, style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Medium, color = color)
    }
}

// ── 通用 ────────────────────────────────────────────────────

@Composable
private fun CenterMessage(modifier: Modifier = Modifier, message: String) {
    Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text(message, modifier = Modifier.padding(24.dp), style = MaterialTheme.typography.bodyMedium, color = MoonMutedForeground)
    }
}
