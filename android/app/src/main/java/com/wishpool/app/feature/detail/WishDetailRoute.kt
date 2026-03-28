package com.wishpool.app.feature.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
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
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.wishpool.app.core.common.AsyncState
import com.wishpool.app.data.repository.WishesRepository
import com.wishpool.app.domain.wishflow.ValidationRound
import com.wishpool.app.domain.wishflow.WishTask

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WishDetailRoute(
    wishId: String,
    wishesRepository: WishesRepository,
    onBack: () -> Unit,
) {
    val viewModel = remember(wishId) { WishDetailViewModel(wishesRepository) }
    val state by viewModel.uiState.collectAsState()
    var clarifyIntent by rememberSaveable { mutableStateOf("") }
    var clarifyCity by rememberSaveable { mutableStateOf("") }
    var clarifyBudget by rememberSaveable { mutableStateOf("") }
    var clarifyTimeWindow by rememberSaveable { mutableStateOf("") }

    LaunchedEffect(wishId) {
        viewModel.load(wishId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("愿望详情") },
                navigationIcon = { TextButton(onClick = onBack) { Text("返回") } },
            )
        },
    ) { innerPadding ->
        when (val wishState = state.wish) {
            is AsyncState.Success -> LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding),
                contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                item {
                    WishHeader(
                        wish = wishState.data,
                        isConfirming = state.isConfirming,
                        onConfirm = { viewModel.confirm(wishId) },
                    )
                }
                item {
                    ClarifyCard(
                        intent = clarifyIntent,
                        city = clarifyCity,
                        budget = clarifyBudget,
                        timeWindow = clarifyTimeWindow,
                        onIntentChange = { clarifyIntent = it },
                        onCityChange = { clarifyCity = it },
                        onBudgetChange = { clarifyBudget = it },
                        onTimeWindowChange = { clarifyTimeWindow = it },
                        onSubmit = {
                            viewModel.clarify(
                                wishId = wishId,
                                intent = clarifyIntent.ifBlank { null },
                                city = clarifyCity.ifBlank { null },
                                budget = clarifyBudget.ifBlank { null },
                                timeWindow = clarifyTimeWindow.ifBlank { null },
                            )
                        },
                    )
                }
                item {
                    Text("推进轮次", style = MaterialTheme.typography.titleMedium)
                }
                when (val rounds = state.rounds) {
                    is AsyncState.Success -> {
                        items(rounds.data) { round ->
                            RoundCard(round)
                        }
                    }
                    is AsyncState.Error -> item { Text(rounds.message, color = MaterialTheme.colorScheme.error) }
                    AsyncState.Idle, AsyncState.Loading -> item { Text("正在加载轮次…") }
                }
                state.message?.let { message ->
                    item { Text(message, color = MaterialTheme.colorScheme.primary) }
                }
            }
            is AsyncState.Error -> BoxText(Modifier.padding(innerPadding), wishState.message)
            AsyncState.Idle, AsyncState.Loading -> BoxText(Modifier.padding(innerPadding), "正在加载愿望详情…")
        }
    }
}

@Composable
private fun WishHeader(
    wish: WishTask,
    isConfirming: Boolean,
    onConfirm: () -> Unit,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(wish.title, style = MaterialTheme.typography.headlineSmall)
            Text(wish.intent, style = MaterialTheme.typography.bodyLarge)
            Text("状态：${wish.status.name.replace("_", " ")}", color = MaterialTheme.colorScheme.primary)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                wish.city?.let { Text("城市：$it", style = MaterialTheme.typography.bodySmall) }
                wish.budget?.let { Text("预算：$it", style = MaterialTheme.typography.bodySmall) }
                wish.timeWindow?.let { Text("时间：$it", style = MaterialTheme.typography.bodySmall) }
            }
            Button(onClick = onConfirm, enabled = !isConfirming) {
                Text(if (isConfirming) "确认中…" else "确认方案，开始推进")
            }
        }
    }
}

@Composable
private fun ClarifyCard(
    intent: String,
    city: String,
    budget: String,
    timeWindow: String,
    onIntentChange: (String) -> Unit,
    onCityChange: (String) -> Unit,
    onBudgetChange: (String) -> Unit,
    onTimeWindowChange: (String) -> Unit,
    onSubmit: () -> Unit,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("补充关键信息", style = MaterialTheme.typography.titleMedium)
            OutlinedTextField(value = intent, onValueChange = onIntentChange, label = { Text("补充心愿描述") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = city, onValueChange = onCityChange, label = { Text("城市") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = budget, onValueChange = onBudgetChange, label = { Text("预算") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = timeWindow, onValueChange = onTimeWindowChange, label = { Text("时间窗口") }, modifier = Modifier.fillMaxWidth())
            Button(onClick = onSubmit, modifier = Modifier.fillMaxWidth()) {
                Text("提交澄清")
            }
        }
    }
}

@Composable
private fun RoundCard(round: ValidationRound) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("Round ${round.roundNumber}", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
            Text(round.summary, style = MaterialTheme.typography.bodyMedium)
            Text(
                when (round.humanCheckPassed) {
                    true -> "人工校验：已通过"
                    false -> "人工校验：未通过"
                    null -> "人工校验：待确认"
                },
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun BoxText(modifier: Modifier, message: String) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
    ) {
        Text(message, style = MaterialTheme.typography.bodyMedium)
    }
}
