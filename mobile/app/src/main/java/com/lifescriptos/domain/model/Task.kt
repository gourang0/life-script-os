package com.lifescriptos.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Task(
    val id: String = "",
    @SerialName("user_id") val userId: String = "",
    val title: String,
    val description: String? = null,
    val priority: String = "medium",
    val difficulty: Int = 1,
    @SerialName("xp_reward") val xpReward: Int = 10,
    @SerialName("is_completed") val isCompleted: Boolean = false,
    @SerialName("completed_at") val completedAt: String? = null,
    @SerialName("due_date") val dueDate: String? = null,
    @SerialName("scheduled_date") val scheduledDate: String? = null,
    @SerialName("scheduled_start_time") val scheduledStartTime: String? = null,
    @SerialName("scheduled_end_time") val scheduledEndTime: String? = null,
    @SerialName("estimated_minutes") val estimatedMinutes: Int? = null,
    @SerialName("goal_id") val goalId: String? = null,
    @SerialName("created_at") val createdAt: String = "",
    @SerialName("updated_at") val updatedAt: String = ""
)
