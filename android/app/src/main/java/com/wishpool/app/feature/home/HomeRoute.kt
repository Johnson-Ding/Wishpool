package com.wishpool.app.feature.home

import androidx.compose.foundation.background
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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Comment
import androidx.compose.material.icons.automirrored.outlined.List
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.BottomAppBar
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
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
import com.wishpool.app.data.repository.FeedRepository
import com.wishpool.app.data.repository.WishesRepository
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
    onCreateWish: () -> Unit,
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

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Wishpool") },
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = onCreateWish) {
                Icon(Icons.Outlined.Add, contentDescription = "发愿")
            }
        },
        bottomBar = {
            BottomAppBar(
                actions = {
                    HomeTabItem(
                        icon = Icons.Outlined.Explore,
                        label = "广场",
                        active = activeTab == HomeTab.FEED,
                        onClick = { activeTab = HomeTab.FEED },
                    )
                    HomeTabItem(
                        icon = Icons.AutoMirrored.Outlined.List,
                        label = "我的愿望",
                        active = activeTab == HomeTab.MY_WISHES,
                        onClick = { activeTab = HomeTab.MY_WISHES },
                    )
                },
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

@Composable
private fun HomeTabItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    active: Boolean,
    onClick: () -> Unit,
) {
    Column(
        modifier = Modifier
            .padding(horizontal = 16.dp)
            .clickable(onClick = onClick),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = if (active) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Text(
            text = label,
            color = if (active) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
            style = MaterialTheme.typography.labelMedium,
        )
    }
}

@Composable
private fun FeedTab(
    modifier: Modifier = Modifier,
    state: com.wishpool.app.feature.feed.FeedUiState,
    onLike: (Int) -> Unit,
    onComment: (Int) -> Unit,
) {
    when (val feed = state.feed) {
        is AsyncState.Success -> LazyColumn(
            modifier = modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            item {
                Text(
                    text = "把“发愿”和“别人已经做到的故事”放在同一个入口里，保持产品的进入感。",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            items(feed.data) { item ->
                FeedCard(item = item, onLike = { onLike(item.id) }, onComment = { onComment(item.id) })
            }
        }
        is AsyncState.Error -> CenterMessage(modifier, feed.message)
        AsyncState.Idle, AsyncState.Loading -> CenterMessage(modifier, "正在加载 Feed…")
    }
}

@Composable
private fun FeedCard(
    item: FeedItem,
    onLike: () -> Unit,
    onComment: () -> Unit,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(18.dp)) {
            Text(item.tag, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary)
            Spacer(modifier = Modifier.height(8.dp))
            Text(item.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(6.dp))
            Text(item.meta, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(item.loc, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(modifier = Modifier.height(12.dp))
            Text(item.excerpt, style = MaterialTheme.typography.bodyMedium)
            Spacer(modifier = Modifier.height(16.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.CenterVertically) {
                ActionChip(
                    icon = { Icon(Icons.Outlined.FavoriteBorder, contentDescription = null, modifier = Modifier.size(18.dp)) },
                    text = item.likes.toString(),
                    onClick = onLike,
                )
                ActionChip(
                    icon = { Icon(Icons.AutoMirrored.Outlined.Comment, contentDescription = null, modifier = Modifier.size(18.dp)) },
                    text = "评论",
                    onClick = onComment,
                )
                ActionChip(
                    icon = { Icon(Icons.Outlined.Add, contentDescription = null, modifier = Modifier.size(18.dp)) },
                    text = "我也想做",
                    onClick = {},
                )
            }
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
            .background(MaterialTheme.colorScheme.surfaceVariant, MaterialTheme.shapes.medium)
            .clickable(onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        icon()
        Text(text, style = MaterialTheme.typography.labelLarge)
    }
}

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
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            items(state.data) { section ->
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(section.title, style = MaterialTheme.typography.titleMedium)
                        if (section.title == "待决策") {
                            Box(
                                modifier = Modifier
                                    .background(Color(0xFFD95B43), MaterialTheme.shapes.small)
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
        is AsyncState.Error -> CenterMessage(modifier, "${state.message}\n下拉刷新暂未接入，你可以返回重试。")
        AsyncState.Idle, AsyncState.Loading -> CenterMessage(modifier, "正在加载我的愿望…")
    }
}

@Composable
private fun WishSummaryCard(
    wish: WishTask,
    onClick: () -> Unit,
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(wish.title, style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(6.dp))
            Text(wish.intent, style = MaterialTheme.typography.bodyMedium)
            Spacer(modifier = Modifier.height(10.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                StatusPill(label = wish.status.name.replace("_", " "))
                wish.city?.let {
                    Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                Spacer(modifier = Modifier.weight(1f))
                Icon(Icons.Outlined.Schedule, contentDescription = null, modifier = Modifier.size(16.dp))
                Text(
                    text = wish.updatedAt.takeIf { it.isNotBlank() }?.substringBefore("T") ?: "待更新",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

@Composable
private fun StatusPill(label: String) {
    Box(
        modifier = Modifier
            .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.12f), MaterialTheme.shapes.small)
            .padding(horizontal = 10.dp, vertical = 4.dp),
    ) {
        Text(label, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary)
    }
}

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
        title = { Text("评论") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                when (comments) {
                    is AsyncState.Success -> {
                        if (comments.data.isEmpty()) {
                            Text("还没有评论，做第一个回应的人。")
                        } else {
                            comments.data.takeLast(3).forEach { comment ->
                                Text("• ${comment.authorName}：${comment.content}")
                            }
                        }
                    }
                    is AsyncState.Error -> Text(comments.message)
                    AsyncState.Idle, AsyncState.Loading -> Text("正在加载评论…")
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
            TextButton(onClick = onDismiss) {
                Text("关闭")
            }
        },
    )
}

@Composable
private fun CenterMessage(
    modifier: Modifier = Modifier,
    message: String,
) {
    Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text(
            text = message,
            modifier = Modifier.padding(24.dp),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}
