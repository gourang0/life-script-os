package com.lifescriptos.ui.screens.goals

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lifescriptos.data.repository.GoalRepository
import com.lifescriptos.domain.model.Goal
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class GoalsUiState(
    val isLoading: Boolean = true,
    val goals: List<Goal> = emptyList(),
    val showCreateDialog: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class GoalsViewModel @Inject constructor(
    private val goalRepository: GoalRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(GoalsUiState())
    val uiState: StateFlow<GoalsUiState> = _uiState.asStateFlow()

    init {
        loadGoals()
    }

    fun loadGoals() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            goalRepository.getGoals()
                .onSuccess { goals ->
                    _uiState.update { it.copy(goals = goals, isLoading = false) }
                }
                .onFailure { e ->
                    _uiState.update { it.copy(error = e.message, isLoading = false) }
                }
        }
    }

    fun showCreateDialog() {
        _uiState.update { it.copy(showCreateDialog = true) }
    }

    fun hideCreateDialog() {
        _uiState.update { it.copy(showCreateDialog = false) }
    }

    fun createGoal(title: String, description: String?, category: String?, targetDate: String?) {
        viewModelScope.launch {
            val goal = Goal(
                title = title,
                description = description,
                category = category,
                targetDate = targetDate
            )
            goalRepository.createGoal(goal)
                .onSuccess {
                    hideCreateDialog()
                    loadGoals()
                }
                .onFailure { e ->
                    _uiState.update { it.copy(error = e.message) }
                }
        }
    }

    fun updateProgress(goalId: String, progress: Int) {
        viewModelScope.launch {
            goalRepository.updateGoalProgress(goalId, progress)
                .onSuccess { loadGoals() }
        }
    }

    fun deleteGoal(goalId: String) {
        viewModelScope.launch {
            goalRepository.deleteGoal(goalId)
                .onSuccess { loadGoals() }
        }
    }
}
