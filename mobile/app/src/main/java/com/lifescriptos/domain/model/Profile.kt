package com.lifescriptos.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Profile(
    val id: String,
    @SerialName("display_name") val displayName: String? = null,
    @SerialName("avatar_url") val avatarUrl: String? = null,
    val level: Int = 1,
    @SerialName("xp_points") val xpPoints: Int = 0,
    @SerialName("current_streak") val currentStreak: Int = 0,
    @SerialName("best_streak") val bestStreak: Int = 0,
    @SerialName("total_tasks_completed") val totalTasksCompleted: Int = 0,
    @SerialName("streak_freeze_count") val streakFreezeCount: Int = 0,
    @SerialName("calorie_goal") val calorieGoal: Int? = null,
    val age: Int? = null,
    val gender: String? = null,
    @SerialName("weight_kg") val weightKg: Double? = null,
    @SerialName("height_cm") val heightCm: Double? = null,
    @SerialName("activity_level") val activityLevel: String? = null
)
