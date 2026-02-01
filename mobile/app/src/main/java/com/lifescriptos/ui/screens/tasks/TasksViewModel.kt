package com.lifescriptos.ui.screens.tasks

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lifescriptos.data.repository.TaskRepository
import com.lifescriptos.domain.model.Task
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class TasksUiState(
    val isLoading: Boolean = true,
    val tasks: List<Task> = emptyList(),
    val filter: TaskFilter = TaskFilter.ALL,
    val error: String? = null
)

enum class TaskFilter {
    ALL, ACTIVE, COMPLETED
}

@HiltViewModel
class TasksViewModel @Inject constructor(
    private val taskRepository: TaskRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(TasksUiState())
    val uiState: StateFlow<TasksUiState> = _uiState.asStateFlow()

    init {
        loadTasks()
    }

    fun loadTasks() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            taskRepository.getTasks()
                .onSuccess { tasks ->
                    _uiState.update { it.copy(tasks = tasks, isLoading = false) }
                }
                .onFailure { e ->
                    _uiState.update { it.copy(error = e.message, isLoading = false) }
                }
        }
    }

    fun setFilter(filter: TaskFilter) {
        _uiState.update { it.copy(filter = filter) }
    }

    fun getFilteredTasks(): List<Task> {
        val tasks = _uiState.value.tasks
        return when (_uiState.value.filter) {
            TaskFilter.ALL -> tasks
            TaskFilter.ACTIVE -> tasks.filter { !it.isCompleted }
            TaskFilter.COMPLETED -> tasks.filter { it.isCompleted }
        }
    }

    fun createTask(title: String, description: String?, priority: String, dueDate: String?) {
        viewModelScope.launch {
            val task = Task(
                title = title,
                description = description,
                priority = priority,
                dueDate = dueDate
            )
            taskRepository.createTask(task)
                .onSuccess { loadTasks() }
        }
    }

    fun toggleTask(taskId: String, isCompleted: Boolean) {
        viewModelScope.launch {
            taskRepository.toggleTaskCompletion(taskId, isCompleted)
                .onSuccess { loadTasks() }
        }
    }

    fun deleteTask(taskId: String) {
        viewModelScope.launch {
            taskRepository.deleteTask(taskId)
                .onSuccess { loadTasks() }
        }
    }
}
