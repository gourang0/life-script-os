package com.lifescriptos.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class DailySummary(
    val id: String = "",
    @SerialName("user_id") val userId: String = "",
    @SerialName("summary_date") val summaryDate: String,
    @SerialName("tasks_scheduled") val tasksScheduled: Int = 0,
    @SerialName("tasks_completed") val tasksCompleted: Int = 0,
    @SerialName("routines_scheduled") val routinesScheduled: Int = 0,
    @SerialName("routines_completed") val routinesCompleted: Int = 0,
    @SerialName("discipline_percentage") val disciplinePercentage: Int = 0,
    @SerialName("total_xp_earned") val totalXpEarned: Int = 0,
    @SerialName("total_calories_in") val totalCaloriesIn: Int? = null,
    @SerialName("total_calories_out") val totalCaloriesOut: Int? = null,
    @SerialName("sleep_hours") val sleepHours: Double? = null,
    @SerialName("ai_feedback") val aiFeedback: String? = null,
    @SerialName("created_at") val createdAt: String = ""
)
