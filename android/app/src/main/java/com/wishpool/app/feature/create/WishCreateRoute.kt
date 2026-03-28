package com.wishpool.app.feature.create

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.wishpool.app.data.repository.WishesRepository

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WishCreateRoute(
    wishesRepository: WishesRepository,
    onBack: () -> Unit,
    onCreated: (String) -> Unit,
) {
    val viewModel = remember { WishCreateViewModel(wishesRepository) }
    val state by viewModel.uiState.collectAsState()

    LaunchedEffect(state.createdWish?.id) {
        state.createdWish?.id?.let { onCreated(it) }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("说出你的心愿") },
                navigationIcon = {
                    TextButton(onClick = onBack) { Text("返回") }
                },
            )
        },
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Text(
                "先把愿望说清楚，后续再进入方案和推进。",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            OutlinedTextField(
                value = state.form.intent,
                onValueChange = viewModel::updateIntent,
                label = { Text("你现在最想实现什么？") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 3,
            )
            OutlinedTextField(
                value = state.form.city,
                onValueChange = viewModel::updateCity,
                label = { Text("城市（可选）") },
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = state.form.budget,
                onValueChange = viewModel::updateBudget,
                label = { Text("预算（可选）") },
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = state.form.timeWindow,
                onValueChange = viewModel::updateTimeWindow,
                label = { Text("时间窗口（可选）") },
                modifier = Modifier.fillMaxWidth(),
            )

            state.errorMessage?.let {
                Text(it, color = MaterialTheme.colorScheme.error)
            }

            Button(
                onClick = viewModel::submit,
                modifier = Modifier.fillMaxWidth(),
                contentPadding = PaddingValues(vertical = 14.dp),
                enabled = !state.isSubmitting,
            ) {
                Text(if (state.isSubmitting) "提交中…" else "生成初版愿望")
            }
        }
    }
}
