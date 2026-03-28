package com.wishpool.app.feature.detail

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wishpool.app.core.common.AsyncState
import com.wishpool.app.data.repository.WishesRepository
import com.wishpool.app.domain.wishflow.ValidationRound
import com.wishpool.app.domain.wishflow.WishTask
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class WishDetailUiState(
    val wish: AsyncState<WishTask> = AsyncState.Idle,
    val rounds: AsyncState<List<ValidationRound>> = AsyncState.Idle,
    val isConfirming: Boolean = false,
    val message: String? = null,
)

class WishDetailViewModel(
    private val repository: WishesRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow(WishDetailUiState())
    val uiState: StateFlow<WishDetailUiState> = _uiState.asStateFlow()

    fun load(id: String) {
        if ((_uiState.value.wish as? AsyncState.Success)?.data?.id == id) return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(wish = AsyncState.Loading, rounds = AsyncState.Loading)
            runCatching { repository.getWish(id) }
                .onSuccess { wish ->
                    _uiState.value = _uiState.value.copy(wish = AsyncState.Success(wish))
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(wish = AsyncState.Error(error.message ?: "愿望加载失败"))
                }

            runCatching { repository.listRounds(id) }
                .onSuccess { rounds ->
                    _uiState.value = _uiState.value.copy(rounds = AsyncState.Success(rounds))
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(rounds = AsyncState.Error(error.message ?: "轮次加载失败"))
                }
        }
    }

    fun confirm(id: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isConfirming = true)
            runCatching { repository.confirmWishPlan(id) }
                .onSuccess { wish ->
                    _uiState.value = _uiState.value.copy(
                        wish = AsyncState.Success(wish),
                        isConfirming = false,
                        message = "方案已确认",
                    )
                    load(id)
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isConfirming = false,
                        message = error.message ?: "确认失败",
                    )
                }
        }
    }

    fun clarify(
        wishId: String,
        intent: String?,
        city: String?,
        budget: String?,
        timeWindow: String?,
    ) {
        viewModelScope.launch {
            runCatching {
                repository.clarifyWish(
                    id = wishId,
                    intent = intent,
                    city = city,
                    budget = budget,
                    timeWindow = timeWindow,
                )
            }.onSuccess { wish ->
                _uiState.value = _uiState.value.copy(
                    wish = AsyncState.Success(wish),
                    message = "澄清信息已更新",
                )
                load(wishId)
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(message = error.message ?: "澄清失败")
            }
        }
    }

    fun consumeMessage() {
        _uiState.value = _uiState.value.copy(message = null)
    }
}
