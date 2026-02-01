package com.lifescriptos.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Goal(
    val id: String = "",
    @SerialName("user_id") val userId: String = "",
    val title: String,
    val description: String? = null,
    val category: String? = null,
    @SerialName("target_date") val targetDate: String? = null,
    @SerialName("progress_percentage") val progressPercentage: Int = 0,
    @SerialName("is_completed") val isCompleted: Boolean = false,
    @SerialName("created_at") val createdAt: String = "",
    @SerialName("updated_at") val updatedAt: String = ""
)
