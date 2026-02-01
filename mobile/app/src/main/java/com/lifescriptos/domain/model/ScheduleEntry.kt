package com.lifescriptos.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ScheduleEntry(
    val id: String = "",
    @SerialName("user_id") val userId: String = "",
    val title: String,
    @SerialName("entry_date") val entryDate: String,
    @SerialName("start_time") val startTime: String,
    @SerialName("end_time") val endTime: String,
    @SerialName("entry_type") val entryType: String = "custom",
    @SerialName("is_completed") val isCompleted: Boolean = false,
    @SerialName("completed_at") val completedAt: String? = null,
    @SerialName("task_id") val taskId: String? = null,
    @SerialName("routine_id") val routineId: String? = null,
    @SerialName("created_at") val createdAt: String = ""
)
