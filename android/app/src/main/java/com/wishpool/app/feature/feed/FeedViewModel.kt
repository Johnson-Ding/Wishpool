package com.wishpool.app.feature.feed

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wishpool.app.core.common.AsyncState
import com.wishpool.app.data.repository.FeedRepository
import com.wishpool.app.domain.wishflow.FeedComment
import com.wishpool.app.domain.wishflow.FeedItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class FeedUiState(
    val feed: AsyncState<List<FeedItem>> = AsyncState.Idle,
    val selectedComments: AsyncState<List<FeedComment>> = AsyncState.Idle,
    val selectedBottleId: Int? = null,
    val actionMessage: String? = null,
)

class FeedViewModel(
    private val repository: FeedRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow(FeedUiState())
    val uiState: StateFlow<FeedUiState> = _uiState.asStateFlow()

    fun loadFeed() {
        if (_uiState.value.feed is AsyncState.Success) return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(feed = AsyncState.Loading)
            runCatching { repository.listFeed(24) }
                .onSuccess { items ->
                    _uiState.value = _uiState.value.copy(feed = AsyncState.Success(items))
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(feed = AsyncState.Error(error.message ?: "加载失败"))
                }
        }
    }

    fun like(id: Int) {
        viewModelScope.launch {
            runCatching { repository.likeFeedItem(id) }
                .onSuccess { updated ->
                    val current = (_uiState.value.feed as? AsyncState.Success)?.data.orEmpty()
                    _uiState.value = _uiState.value.copy(
                        feed = AsyncState.Success(current.map { if (it.id == id) updated else it }),
                        actionMessage = "已点赞",
                    )
                }
                .onFailure {
                    _uiState.value = _uiState.value.copy(actionMessage = "点赞失败，请确认后端可访问")
                }
        }
    }

    fun openComments(id: Int) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(selectedBottleId = id, selectedComments = AsyncState.Loading)
            runCatching { repository.listComments(id) }
                .onSuccess { comments ->
                    _uiState.value = _uiState.value.copy(selectedComments = AsyncState.Success(comments))
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(selectedComments = AsyncState.Error(error.message ?: "评论加载失败"))
                }
        }
    }

    fun closeComments() {
        _uiState.value = _uiState.value.copy(selectedBottleId = null, selectedComments = AsyncState.Idle)
    }

    fun comment(bottleId: Int, content: String) {
        viewModelScope.launch {
            runCatching { repository.createComment(bottleId, content) }
                .onSuccess {
                    openComments(bottleId)
                    _uiState.value = _uiState.value.copy(actionMessage = "评论已发送")
                }
                .onFailure {
                    _uiState.value = _uiState.value.copy(actionMessage = "评论失败，请确认后端可访问")
                }
        }
    }

    fun consumeMessage() {
        _uiState.value = _uiState.value.copy(actionMessage = null)
    }
}

