package com.wishpool.app.feature.create

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wishpool.app.data.repository.WishesRepository
import com.wishpool.app.domain.wishflow.WishTask
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class WishCreateForm(
    val intent: String = "",
    val city: String = "",
    val budget: String = "",
    val timeWindow: String = "",
)

data class WishCreateUiState(
    val form: WishCreateForm = WishCreateForm(),
    val isSubmitting: Boolean = false,
    val errorMessage: String? = null,
    val createdWish: WishTask? = null,
)

class WishCreateViewModel(
    private val repository: WishesRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow(WishCreateUiState())
    val uiState: StateFlow<WishCreateUiState> = _uiState.asStateFlow()

    fun updateIntent(value: String) {
        _uiState.value = _uiState.value.copy(form = _uiState.value.form.copy(intent = value))
    }

    fun updateCity(value: String) {
        _uiState.value = _uiState.value.copy(form = _uiState.value.form.copy(city = value))
    }

    fun updateBudget(value: String) {
        _uiState.value = _uiState.value.copy(form = _uiState.value.form.copy(budget = value))
    }

    fun updateTimeWindow(value: String) {
        _uiState.value = _uiState.value.copy(form = _uiState.value.form.copy(timeWindow = value))
    }

    fun submit() {
        val form = _uiState.value.form
        if (form.intent.isBlank()) {
            _uiState.value = _uiState.value.copy(errorMessage = "请先填写你的心愿")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSubmitting = true, errorMessage = null)
            runCatching {
                repository.createWish(
                    intent = form.intent.trim(),
                    city = form.city.ifBlank { null },
                    budget = form.budget.ifBlank { null },
                    timeWindow = form.timeWindow.ifBlank { null },
                )
            }.onSuccess { wish ->
                _uiState.value = WishCreateUiState(createdWish = wish)
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    isSubmitting = false,
                    errorMessage = error.message ?: "创建失败",
                )
            }
        }
    }

    fun consumeCreatedWish() {
        _uiState.value = _uiState.value.copy(createdWish = null, isSubmitting = false)
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }
}

