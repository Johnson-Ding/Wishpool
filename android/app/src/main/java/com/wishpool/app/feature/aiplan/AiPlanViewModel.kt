package com.wishpool.app.feature.aiplan

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wishpool.app.domain.model.AiPlanStep
import com.wishpool.app.domain.model.GeneratedPlan
import com.wishpool.app.data.repository.WishesRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class AiPlanUiState {
    data object Loading : AiPlanUiState()
    data class Success(val plan: GeneratedPlan) : AiPlanUiState()
    data class Error(val message: String) : AiPlanUiState()
}

class AiPlanViewModel(
    private val wishesRepository: WishesRepository,
    private val wishInput: String,
) : ViewModel() {

    private val _uiState = MutableStateFlow<AiPlanUiState>(AiPlanUiState.Loading)
    val uiState: StateFlow<AiPlanUiState> = _uiState

    init {
        loadPlan()
    }

    private fun loadPlan() {
        viewModelScope.launch {
            _uiState.value = AiPlanUiState.Loading
            try {
                val plan = wishesRepository.generateAIPlan(wishInput)
                if (plan != null) {
                    // 缓存方案（使用 wishText 的 hash 作为 key）
                    wishesRepository.cachePlan(wishInput.hashCode().toString(), plan)
                    _uiState.value = AiPlanUiState.Success(plan)
                } else {
                    _uiState.value = AiPlanUiState.Error("方案生成失败，请重试")
                }
            } catch (e: Exception) {
                _uiState.value = AiPlanUiState.Error(e.message ?: "未知错误")
            }
        }
    }

    fun retry() {
        loadPlan()
    }
}
