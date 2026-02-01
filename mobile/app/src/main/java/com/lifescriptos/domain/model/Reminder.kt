package com.lifescriptos.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Reminder(
    val id: String = "",
    @SerialName("user_id") val userId: String = "",
    val content: String,
    val priority: Int = 1,
    @SerialName("is_completed") val isCompleted: Boolean = false,
    @SerialName("reminder_time") val reminderTime: String? = null,
    @SerialName("created_at") val createdAt: String = "",
    @SerialName("updated_at") val updatedAt: String = ""
)
