package com.lifescriptos.ui.screens.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lifescriptos.data.repository.ProfileRepository
import com.lifescriptos.data.repository.TaskRepository
import com.lifescriptos.domain.model.Profile
import com.lifescriptos.domain.model.Task
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import javax.inject.Inject

data class DashboardUiState(
    val isLoading: Boolean = true,
    val profile: Profile? = null,
    val todayTasks: List<Task> = emptyList(),
    val completedToday: Int = 0,
    val error: String? = null
)

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val profileRepository: ProfileRepository,
    private val taskRepository: TaskRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        loadDashboardData()
    }

    fun loadDashboardData() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            
            val today = LocalDate.now().format(DateTimeFormatter.ISO_DATE)
            
            // Load profile
            profileRepository.getProfile()
                .onSuccess { profile ->
                    _uiState.update { it.copy(profile = profile) }
                }
                .onFailure { e ->
                    _uiState.update { it.copy(error = e.message) }
                }
            
            // Load today's tasks
            taskRepository.getTasksByDate(today)
                .onSuccess { tasks ->
                    _uiState.update { 
                        it.copy(
                            todayTasks = tasks,
                            completedToday = tasks.count { t -> t.isCompleted },
                            isLoading = false
                        ) 
                    }
                }
                .onFailure { e ->
                    _uiState.update { it.copy(error = e.message, isLoading = false) }
                }
        }
    }

    fun toggleTask(taskId: String, isCompleted: Boolean) {
        viewModelScope.launch {
            taskRepository.toggleTaskCompletion(taskId, isCompleted)
                .onSuccess {
                    loadDashboardData()
                }
        }
    }

    // Calculate XP needed for next level
    fun getXpForNextLevel(level: Int): Int = level * 100

    // Calculate level progress percentage
    fun getLevelProgress(profile: Profile?): Float {
        if (profile == null) return 0f
        val xpForLevel = getXpForNextLevel(profile.level)
        val currentLevelXp = profile.xpPoints % xpForLevel
        return currentLevelXp.toFloat() / xpForLevel.toFloat()
    }
}
