package com.wishpool.app.feature.wishchat

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

data class ChatMessage(
    val id: String,
    val role: String,
    val content: String,
    val timestamp: Long
)

/**
 * 许愿气泡提示
 */
@Composable
fun WishBubblePrompt(
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF6366F1).copy(alpha = 0.9f)
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "检测到许愿内容",
                style = MaterialTheme.typography.titleMedium,
                color = Color.White
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "是否将此内容作为正式愿望提交？AI 将为你生成执行方案。",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.White.copy(alpha = 0.9f)
            )

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                TextButton(onClick = onDismiss) {
                    Text("取消", color = Color.White)
                }

                Spacer(modifier = Modifier.width(8.dp))

                Button(
                    onClick = onConfirm,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color.White,
                        contentColor = Color(0xFF6366F1)
                    )
                ) {
                    Text("确认提交")
                }
            }
        }
    }
}

/**
 * 碎碎念气泡提示
 */
@Composable
fun CasualBubblePrompt(
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF8B5CF6).copy(alpha = 0.9f)
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "碎碎念",
                style = MaterialTheme.typography.titleMedium,
                color = Color.White
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "这看起来是一条碎碎念。是否匿名发布到广场？",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.White.copy(alpha = 0.9f)
            )

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                TextButton(onClick = onDismiss) {
                    Text("取消", color = Color.White)
                }

                Spacer(modifier = Modifier.width(8.dp))

                Button(
                    onClick = onConfirm,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color.White,
                        contentColor = Color(0xFF8B5CF6)
                    )
                ) {
                    Text("匿名发布")
                }
            }
        }
    }
}

@Composable
fun WishChatTab(
    modifier: Modifier = Modifier,
    onCreateWish: (String) -> Unit = {}
) {
    var inputText by remember { mutableStateOf("") }
    var messages by remember { mutableStateOf(listOf<ChatMessage>()) }
    var showWishBubble by remember { mutableStateOf(false) }
    var showCasualBubble by remember { mutableStateOf(false) }
    var pendingWishInput by remember { mutableStateOf("") }
    val listState = rememberLazyListState()

    // 初始化欢迎消息
    LaunchedEffect(Unit) {
        messages = listOf(
            ChatMessage(
                id = "1",
                role = "assistant",
                content = "你好呀～我是眠眠月，今天有什么想聊聊的，或者有什么心愿想慢慢说给我听吗？",
                timestamp = System.currentTimeMillis()
            )
        )
    }

    // 自动滚动到底部
    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF1A1A2E))
    ) {
        // 消息列表
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            state = listState,
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(messages) { message ->
                MessageBubble(message)
            }
        }

        // 许愿气泡提示
        if (showWishBubble) {
            WishBubblePrompt(
                onConfirm = {
                    // 添加用户消息
                    messages = messages + ChatMessage(
                        id = (messages.size + 1).toString(),
                        role = "user",
                        content = pendingWishInput,
                        timestamp = System.currentTimeMillis()
                    )

                    // 模拟 AI 回复
                    messages = messages + ChatMessage(
                        id = (messages.size + 2).toString(),
                        role = "assistant",
                        content = "收到，我先把这件事整理成正式愿望，马上给你第一版执行方案。",
                        timestamp = System.currentTimeMillis()
                    )

                    showWishBubble = false

                    // 导航到愿望策划页
                    onCreateWish(pendingWishInput)
                    pendingWishInput = ""
                },
                onDismiss = {
                    showWishBubble = false
                    pendingWishInput = ""
                }
            )
        }

        // 碎碎念气泡提示
        if (showCasualBubble) {
            CasualBubblePrompt(
                onConfirm = {
                    // 添加用户消息（碎碎念模式）
                    messages = messages + ChatMessage(
                        id = (messages.size + 1).toString(),
                        role = "user",
                        content = pendingWishInput,
                        timestamp = System.currentTimeMillis()
                    )

                    // 模拟 AI 回复
                    messages = messages + ChatMessage(
                        id = (messages.size + 2).toString(),
                        role = "assistant",
                        content = "收到，已匿名发布到广场。",
                        timestamp = System.currentTimeMillis()
                    )

                    showCasualBubble = false
                    pendingWishInput = ""
                },
                onDismiss = {
                    showCasualBubble = false
                    pendingWishInput = ""
                }
            )
        }

        // 输入框
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextField(
                value = inputText,
                onValueChange = { inputText = it },
                modifier = Modifier.weight(1f),
                placeholder = { Text("说点什么...") },
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = Color.White.copy(alpha = 0.1f),
                    unfocusedContainerColor = Color.White.copy(alpha = 0.05f),
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedPlaceholderColor = Color.White.copy(alpha = 0.5f),
                    unfocusedPlaceholderColor = Color.White.copy(alpha = 0.3f)
                ),
                shape = RoundedCornerShape(24.dp)
            )

            Spacer(modifier = Modifier.width(8.dp))

            IconButton(
                onClick = {
                    if (inputText.isNotBlank()) {
                        pendingWishInput = inputText
                        inputText = ""

                        // 检测内容类型
                        if (ScenarioMatcher.isWishContent(pendingWishInput)) {
                            // 显示许愿气泡
                            showWishBubble = true
                        } else {
                            // 显示碎碎念气泡
                            showCasualBubble = true
                        }
                    }
                }
            ) {
                Icon(
                    imageVector = Icons.Default.Send,
                    contentDescription = "发送",
                    tint = Color.White
                )
            }
        }
    }
}

@Composable
fun MessageBubble(message: ChatMessage) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (message.role == "user") Arrangement.End else Arrangement.Start
    ) {
        Card(
            modifier = Modifier
                .widthIn(max = 280.dp),
            colors = CardDefaults.cardColors(
                containerColor = if (message.role == "user") {
                    Color(0xFF6366F1)
                } else {
                    Color.White.copy(alpha = 0.1f)
                }
            ),
            shape = RoundedCornerShape(
                topStart = 16.dp,
                topEnd = 16.dp,
                bottomStart = if (message.role == "user") 16.dp else 4.dp,
                bottomEnd = if (message.role == "user") 4.dp else 16.dp
            )
        ) {
            Text(
                text = message.content,
                modifier = Modifier.padding(12.dp),
                color = Color.White,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}
