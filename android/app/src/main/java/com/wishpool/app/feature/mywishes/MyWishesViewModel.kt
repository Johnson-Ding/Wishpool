package com.wishpool.app.feature.mywishes

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wishpool.app.core.common.AsyncState
import com.wishpool.app.data.repository.WishesRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class MyWishesUiState(
    val sections: AsyncState<List<WishSection>> = AsyncState.Idle,
    val message: String? = null,
)

class MyWishesViewModel(
    private val repository: WishesRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow(MyWishesUiState())
    val uiState: StateFlow<MyWishesUiState> = _uiState.asStateFlow()

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(sections = AsyncState.Loading)
            runCatching { repository.listMyWishes() }
                .onSuccess { wishes ->
                    _uiState.value = _uiState.value.copy(sections = AsyncState.Success(buildWishSections(wishes)))
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(sections = AsyncState.Error(error.message ?: "愿望列表加载失败"))
                }
        }
    }
}
