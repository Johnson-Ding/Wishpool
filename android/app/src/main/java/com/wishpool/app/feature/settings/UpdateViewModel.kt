package com.wishpool.app.feature.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wishpool.app.core.update.UpdateManager
import com.wishpool.app.domain.model.UpdateStatus
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class UpdateViewModel(
    private val updateManager: UpdateManager
) : ViewModel() {

    val updateStatus: StateFlow<UpdateStatus> = updateManager.updateStatus

    fun checkForUpdates() {
        viewModelScope.launch {
            updateManager.checkForUpdates()
        }
    }

    fun downloadUpdate() {
        val update = updateStatus.value.update
        if (update != null) {
            updateManager.downloadUpdate(update)
        }
    }

    fun clearError() {
        updateManager.clearError()
    }

    override fun onCleared() {
        super.onCleared()
        updateManager.cleanup()
    }
}