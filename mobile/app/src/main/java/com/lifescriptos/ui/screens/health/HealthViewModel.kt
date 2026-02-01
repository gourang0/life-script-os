package com.lifescriptos.ui.screens.health

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lifescriptos.data.repository.HealthRepository
import com.lifescriptos.data.repository.ProfileRepository
import com.lifescriptos.domain.model.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import javax.inject.Inject

data class HealthUiState(
    val isLoading: Boolean = true,
    val selectedDate: LocalDate = LocalDate.now(),
    val sleepLogs: List<SleepLog> = emptyList(),
    val nutritionLogs: List<NutritionLog> = emptyList(),
    val exerciseLogs: List<ExerciseLog> = emptyList(),
    val calorieGoal: Int = 2000,
    val error: String? = null
)

@HiltViewModel
class HealthViewModel @Inject constructor(
    private val healthRepository: HealthRepository,
    private val profileRepository: ProfileRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(HealthUiState())
    val uiState: StateFlow<HealthUiState> = _uiState.asStateFlow()

    init {
        loadHealthData()
    }

    fun loadHealthData() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            val dateStr = _uiState.value.selectedDate.format(DateTimeFormatter.ISO_DATE)
            
            // Load profile for calorie goal
            profileRepository.getProfile()
                .onSuccess { profile ->
                    profile?.calorieGoal?.let { goal ->
                        _uiState.update { it.copy(calorieGoal = goal) }
                    }
                }
            
            // Load sleep logs
            healthRepository.getSleepLogs(dateStr)
                .onSuccess { logs ->
                    _uiState.update { it.copy(sleepLogs = logs) }
                }
            
            // Load nutrition logs
            healthRepository.getNutritionLogs(dateStr)
                .onSuccess { logs ->
                    _uiState.update { it.copy(nutritionLogs = logs) }
                }
            
            // Load exercise logs
            healthRepository.getExerciseLogs(dateStr)
                .onSuccess { logs ->
                    _uiState.update { it.copy(exerciseLogs = logs, isLoading = false) }
                }
                .onFailure { e ->
                    _uiState.update { it.copy(error = e.message, isLoading = false) }
                }
        }
    }

    fun getTotalCalories(): Int = _uiState.value.nutritionLogs.sumOf { it.calories ?: 0 }
    
    fun getTotalProtein(): Double = _uiState.value.nutritionLogs.sumOf { it.proteinGrams ?: 0.0 }
    
    fun getTotalCaloriesBurned(): Int = _uiState.value.exerciseLogs.sumOf { it.caloriesBurned ?: 0 }
    
    fun getTotalSleepHours(): Double = _uiState.value.sleepLogs.sumOf { it.durationHours ?: 0.0 }

    fun addSleepLog(sleepTime: String?, wakeTime: String?, duration: Double, quality: String?) {
        viewModelScope.launch {
            val dateStr = _uiState.value.selectedDate.format(DateTimeFormatter.ISO_DATE)
            val log = SleepLog(
                logDate = dateStr,
                sleepTime = sleepTime,
                wakeTime = wakeTime,
                durationHours = duration,
                quality = quality
            )
            healthRepository.addSleepLog(log)
                .onSuccess { loadHealthData() }
        }
    }

    fun addNutritionLog(mealType: String, foodItems: String, calories: Int?, protein: Double?) {
        viewModelScope.launch {
            val dateStr = _uiState.value.selectedDate.format(DateTimeFormatter.ISO_DATE)
            val log = NutritionLog(
                logDate = dateStr,
                mealType = mealType,
                foodItems = foodItems,
                calories = calories,
                proteinGrams = protein
            )
            healthRepository.addNutritionLog(log)
                .onSuccess { loadHealthData() }
        }
    }

    fun addExerciseLog(exerciseType: String, duration: Int?, caloriesBurned: Int?) {
        viewModelScope.launch {
            val dateStr = _uiState.value.selectedDate.format(DateTimeFormatter.ISO_DATE)
            val log = ExerciseLog(
                logDate = dateStr,
                exerciseType = exerciseType,
                durationMinutes = duration,
                caloriesBurned = caloriesBurned
            )
            healthRepository.addExerciseLog(log)
                .onSuccess { loadHealthData() }
        }
    }
}
