package com.lifescriptos.ui.screens.schedule

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lifescriptos.data.repository.ScheduleRepository
import com.lifescriptos.domain.model.ScheduleEntry
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import javax.inject.Inject

data class ScheduleUiState(
    val isLoading: Boolean = true,
    val selectedDate: LocalDate = LocalDate.now(),
    val entries: List<ScheduleEntry> = emptyList(),
    val error: String? = null
)

@HiltViewModel
class ScheduleViewModel @Inject constructor(
    private val scheduleRepository: ScheduleRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ScheduleUiState())
    val uiState: StateFlow<ScheduleUiState> = _uiState.asStateFlow()

    init {
        loadSchedule()
    }

    fun loadSchedule() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            val dateStr = _uiState.value.selectedDate.format(DateTimeFormatter.ISO_DATE)
            scheduleRepository.getScheduleEntries(dateStr)
                .onSuccess { entries ->
                    _uiState.update { it.copy(entries = entries, isLoading = false) }
                }
                .onFailure { e ->
                    _uiState.update { it.copy(error = e.message, isLoading = false) }
                }
        }
    }

    fun selectDate(date: LocalDate) {
        _uiState.update { it.copy(selectedDate = date) }
        loadSchedule()
    }

    fun createEntry(title: String, startTime: String, endTime: String) {
        viewModelScope.launch {
            val dateStr = _uiState.value.selectedDate.format(DateTimeFormatter.ISO_DATE)
            val entry = ScheduleEntry(
                title = title,
                entryDate = dateStr,
                startTime = startTime,
                endTime = endTime
            )
            scheduleRepository.createScheduleEntry(entry)
                .onSuccess { loadSchedule() }
        }
    }

    fun toggleEntry(entryId: String, isCompleted: Boolean) {
        viewModelScope.launch {
            scheduleRepository.toggleEntryCompletion(entryId, isCompleted)
                .onSuccess { loadSchedule() }
        }
    }

    fun deleteEntry(entryId: String) {
        viewModelScope.launch {
            scheduleRepository.deleteScheduleEntry(entryId)
                .onSuccess { loadSchedule() }
        }
    }
}
